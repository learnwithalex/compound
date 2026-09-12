import { db } from "@/db";
import { persistPull, type ProviderPull } from "./sync-core";

const BASE = "https://api.polar.sh/v1";

// Polar amounts are in the currency's smallest unit (cents for USD).
// recurring_interval: day | week | month | year, with recurring_interval_count.
interface PolarSubscription {
  id: string;
  amount: number;
  currency: string;
  recurring_interval: "day" | "week" | "month" | "year";
  recurring_interval_count: number;
  status: string; // active | trialing | past_due | canceled | ...
  customer_id?: string | null;
  customer?: { id: string; email?: string | null; name?: string | null; created_at?: string | null } | null;
  product?: { name?: string | null } | null;
  started_at?: string | null;
  ended_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface PolarListResponse {
  items: PolarSubscription[];
  pagination: { total_count: number };
}

async function polarGet<T>(apiKey: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Polar API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

function subscriptionMrr(sub: PolarSubscription): number {
  const perPeriod = sub.amount / Math.max(1, sub.recurring_interval_count);
  switch (sub.recurring_interval) {
    case "month": return Math.round(perPeriod);
    case "year":  return Math.round(perPeriod / 12);
    case "week":  return Math.round(perPeriod * 4.333);
    case "day":   return Math.round(perPeriod * 30);
    default:      return Math.round(perPeriod);
  }
}

async function fetchAllActiveSubs(apiKey: string): Promise<PolarSubscription[]> {
  const result: PolarSubscription[] = [];
  let page = 1;
  while (true) {
    const data = await polarGet<PolarListResponse>(apiKey, "/subscriptions", {
      active: "true",
      limit: "100",
      page: String(page),
    });
    result.push(...data.items);
    if (result.length >= data.pagination.total_count || data.items.length === 0) break;
    page++;
  }
  return result;
}

export async function fetchPolarOverview(apiKey: string): Promise<{ mrrCents: number; activeSubscriptions: number }> {
  const subs = await fetchAllActiveSubs(apiKey);
  return {
    mrrCents: subs.reduce((s, sub) => s + subscriptionMrr(sub), 0),
    activeSubscriptions: subs.length,
  };
}

const dt = (s: string | null | undefined) => (s ? new Date(s) : null);

export async function syncPolarConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "polar") return;

  const subs = await fetchAllActiveSubs(conn.apiKey);

  const custById = new Map<string, ProviderPull["customers"][number]>();
  const normalized: ProviderPull["subscriptions"] = [];

  for (const sub of subs) {
    const custExt = sub.customer?.id ?? sub.customer_id ?? null;
    if (custExt && !custById.has(custExt)) {
      custById.set(custExt, {
        externalId: custExt,
        email: sub.customer?.email ?? null,
        name: sub.customer?.name ?? null,
        signedUpAt: dt(sub.customer?.created_at) ?? dt(sub.started_at),
        metadata: sub.metadata ?? null,
      });
    }
    normalized.push({
      externalId: sub.id,
      customerExternalId: custExt,
      planName: sub.product?.name ?? null,
      status: sub.status === "canceled" ? "canceled" : sub.status,
      mrrCents: sub.status === "canceled" ? 0 : subscriptionMrr(sub),
      currency: sub.currency ?? "usd",
      interval: sub.recurring_interval,
      startedAt: dt(sub.started_at),
      canceledAt: dt(sub.ended_at),
      metadata: sub.metadata ?? null,
    });
  }

  return persistPull(connectionId, { customers: [...custById.values()], subscriptions: normalized });
}
