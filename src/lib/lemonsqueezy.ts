import { db } from "@/db";
import { connections, snapshots } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://api.lemonsqueezy.com/v1";

interface LSSubscription {
  id: string;
  attributes: {
    status: string; // 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired' | 'trialing'
    total_price: number; // in cents (USD by default)
    billing_anchor: number;
    variant_name: string;
    product_name: string;
    renews_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

interface LSPrice {
  attributes: {
    interval: "month" | "year" | null;
    interval_count: number;
    price: number; // in cents
  };
}

async function lsGet<T>(apiKey: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json" },
  });
  if (!res.ok) throw new Error(`LS API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

function subscriptionMrr(sub: LSSubscription): number {
  const price = sub.attributes.total_price; // in cents, already monthly-ish
  // LS total_price is the per-billing-period amount. We need to normalize.
  // LS doesn't expose billing interval directly on the subscription object,
  // but variant names often say "Monthly" / "Yearly". We'll rely on renews_at
  // cadence or just use total_price as-is for monthly (most LS products are monthly).
  // For annual plans LS passes the full year price — we detect via product name heuristic
  // or simply check if price > 100_000 (likely annual). Best-effort normalization.
  const name = (sub.attributes.variant_name + " " + sub.attributes.product_name).toLowerCase();
  const isAnnual = name.includes("year") || name.includes("annual");
  if (isAnnual) return Math.round(price / 12);
  return price;
}

export async function fetchLemonSqueezyOverview(apiKey: string): Promise<{ mrrCents: number; activeSubscriptions: number }> {
  // Validate key and fetch all active subs
  const subs = await fetchAllActiveSubs(apiKey);
  return {
    mrrCents: subs.reduce((s, sub) => s + subscriptionMrr(sub), 0),
    activeSubscriptions: subs.length,
  };
}

async function fetchAllActiveSubs(apiKey: string): Promise<LSSubscription[]> {
  const result: LSSubscription[] = [];
  let page = 1;
  while (true) {
    const data = await lsGet<{ data: LSSubscription[]; meta: { page: { lastPage: number } } }>(
      apiKey,
      "/subscriptions",
      { "filter[status]": "active", "page[size]": "100", "page[number]": String(page) }
    );
    result.push(...data.data);
    if (page >= data.meta.page.lastPage) break;
    page++;
  }
  // Also fetch trialing subs (they'll convert and are legit MRR commitments)
  let trialPage = 1;
  while (true) {
    const data = await lsGet<{ data: LSSubscription[]; meta: { page: { lastPage: number } } }>(
      apiKey,
      "/subscriptions",
      { "filter[status]": "trialing", "page[size]": "100", "page[number]": String(trialPage) }
    );
    result.push(...data.data);
    if (trialPage >= data.meta.page.lastPage) break;
    trialPage++;
  }
  return result;
}

export async function syncLemonSqueezyConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "lemonsqueezy") return;

  const today = new Date().toISOString().slice(0, 10);
  const subs = await fetchAllActiveSubs(conn.apiKey);

  const mrrCents = subs.reduce((s, sub) => s + subscriptionMrr(sub), 0);
  const activeSubscriptions = subs.length;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const prevDate = yesterday.toISOString().slice(0, 10);

  const prevSnap = await db.query.snapshots.findFirst({
    where: (s, { eq, and }) => and(eq(s.connectionId, connectionId), eq(s.date, prevDate)),
  });

  const prevMrr = prevSnap?.mrrCents ?? 0;
  const diff = mrrCents - prevMrr;

  await db.insert(snapshots).values({
    connectionId,
    date: today,
    mrrCents,
    newMrrCents: diff > 0 ? diff : 0,
    churnedMrrCents: diff < 0 ? Math.abs(diff) : 0,
    expansionMrrCents: 0,
    contractionMrrCents: 0,
    activeSubscriptions,
  }).onConflictDoUpdate({
    target: [snapshots.connectionId, snapshots.date],
    set: { mrrCents, newMrrCents: diff > 0 ? diff : 0, churnedMrrCents: diff < 0 ? Math.abs(diff) : 0, activeSubscriptions },
  });

  await db.update(connections)
    .set({ lastSyncedAt: new Date() })
    .where(eq(connections.id, connectionId));

  return { mrrCents, activeSubscriptions };
}
