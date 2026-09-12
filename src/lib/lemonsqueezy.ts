import { db } from "@/db";
import { persistPull, type ProviderPull } from "./sync-core";

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
    customer_id: number;
    user_email: string | null;
    user_name: string | null;
    trial_ends_at: string | null;
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

const dt = (s: string | null | undefined) => (s ? new Date(s) : null);

export async function syncLemonSqueezyConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "lemonsqueezy") return;

  const subs = await fetchAllActiveSubs(conn.apiKey);

  const custById = new Map<string, ProviderPull["customers"][number]>();
  const normalized: ProviderPull["subscriptions"] = [];

  for (const sub of subs) {
    const a = sub.attributes;
    const custExt = a.customer_id != null ? String(a.customer_id) : null;
    if (custExt && !custById.has(custExt)) {
      custById.set(custExt, {
        externalId: custExt,
        email: a.user_email ?? null,
        name: a.user_name ?? null,
        signedUpAt: dt(a.created_at),
      });
    }
    const isAnnual = `${a.variant_name} ${a.product_name}`.toLowerCase().match(/year|annual/);
    normalized.push({
      externalId: sub.id,
      customerExternalId: custExt,
      planName: a.variant_name ?? a.product_name ?? null,
      status: a.status === "cancelled" || a.status === "expired" ? "canceled" : a.status,
      mrrCents: subscriptionMrr(sub),
      currency: "usd",
      interval: isAnnual ? "year" : "month",
      startedAt: dt(a.created_at),
      trialEndAt: dt(a.trial_ends_at),
      canceledAt: dt(a.ends_at),
    });
  }

  return persistPull(connectionId, { customers: [...custById.values()], subscriptions: normalized });
}
