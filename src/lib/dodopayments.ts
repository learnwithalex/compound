import { db } from "@/db";
import { connections, snapshots } from "@/db/schema";
import { eq } from "drizzle-orm";

// Dodo Payments: separate test/live environments, derived from the key prefix
// (dodo_test_* → test.dodopayments.com, anything else → live.dodopayments.com).
// Auth: Authorization: Bearer <key>.
// Amounts in smallest currency unit (cents for USD). Status filter: status=active.
// Pagination: page_number + page_size.
interface DodoSubscription {
  subscription_id: string;
  status: string; // active | pending | on_hold | paused | cancelled | ...
  currency: string;
  quantity: number;
  recurring_pre_tax_amount: number;
  payment_frequency_interval: "Day" | "Week" | "Month" | "Year";
  payment_frequency_count: number;
}

interface DodoListResponse {
  items: DodoSubscription[];
}

function baseFor(apiKey: string): string {
  return apiKey.startsWith("dodo_test_")
    ? "https://test.dodopayments.com"
    : "https://live.dodopayments.com";
}

async function dodoGet<T>(apiKey: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${baseFor(apiKey)}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Dodo API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

function subscriptionMrr(sub: DodoSubscription): number {
  const perPeriod = (sub.recurring_pre_tax_amount * Math.max(1, sub.quantity)) / Math.max(1, sub.payment_frequency_count);
  switch (sub.payment_frequency_interval) {
    case "Month": return Math.round(perPeriod);
    case "Year":  return Math.round(perPeriod / 12);
    case "Week":  return Math.round(perPeriod * 4.333);
    case "Day":   return Math.round(perPeriod * 30);
    default:      return Math.round(perPeriod);
  }
}

async function fetchAllActiveSubs(apiKey: string): Promise<DodoSubscription[]> {
  const result: DodoSubscription[] = [];
  let page = 1;
  while (true) {
    const data = await dodoGet<DodoListResponse>(apiKey, "/subscriptions", {
      status: "active",
      page_number: String(page),
      page_size: "100",
    });
    result.push(...data.items);
    if (data.items.length < 100) break;
    page++;
  }
  return result;
}

export async function fetchDodoOverview(apiKey: string): Promise<{ mrrCents: number; activeSubscriptions: number }> {
  const subs = await fetchAllActiveSubs(apiKey);
  return {
    mrrCents: subs.reduce((s, sub) => s + subscriptionMrr(sub), 0),
    activeSubscriptions: subs.length,
  };
}

export async function syncDodoConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "dodopayments") return;

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
