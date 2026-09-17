import { db } from "@/db";
import { persistPull, type ProviderPull } from "./sync-core";

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
  customer?: { customer_id: string; email?: string | null; name?: string | null } | null;
  product_id?: string | null;
  created_at?: string | null;
  cancelled_at?: string | null;
  trial_period_days?: number | null;
  metadata?: Record<string, unknown> | null;
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
  let page = 0;
  while (true) {
    const raw = await dodoGet<unknown>(apiKey, "/subscriptions", {
      page_number: String(page),
      page_size: "100",
    });
    console.log("[dodo-sync] subs page", page, JSON.stringify(raw).slice(0, 800));
    const data = raw as DodoListResponse;
    const items = Array.isArray(data.items) ? data.items : [];
    result.push(...items);
    if (items.length < 100) break;
    page++;
  }
  // Also probe specific subscription from payment
  try {
    const sub = await dodoGet<unknown>(apiKey, "/subscriptions/sub_0NXgtr2YnRZc6meX1JMCq");
    console.log("[dodo-sync] direct sub lookup:", JSON.stringify(sub).slice(0, 800));
  } catch (e) {
    console.log("[dodo-sync] direct sub lookup error:", String(e));
  }
  console.log("[dodo-sync] total subs:", result.length, result.map(s => ({ id: s.subscription_id, status: s.status, amount: s.recurring_pre_tax_amount })));
  return result.filter(s => s.status === "active");
}

export async function fetchDodoOverview(apiKey: string): Promise<{ mrrCents: number; activeSubscriptions: number }> {
  const subs = await fetchAllActiveSubs(apiKey);
  return {
    mrrCents: subs.reduce((s, sub) => s + subscriptionMrr(sub), 0),
    activeSubscriptions: subs.length,
  };
}

const dt = (s: string | null | undefined) => (s ? new Date(s) : null);

export async function syncDodoConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "dodopayments") return;

  const subs = await fetchAllActiveSubs(conn.apiKey);

  const custById = new Map<string, ProviderPull["customers"][number]>();
  const normalized: ProviderPull["subscriptions"] = [];

  for (const sub of subs) {
    const custExt = sub.customer?.customer_id ?? null;
    if (custExt && !custById.has(custExt)) {
      custById.set(custExt, {
        externalId: custExt,
        email: sub.customer?.email ?? null,
        name: sub.customer?.name ?? null,
        signedUpAt: dt(sub.created_at),
        metadata: sub.metadata ?? null,
      });
    }
    normalized.push({
      externalId: sub.subscription_id,
      customerExternalId: custExt,
      planName: sub.product_id ?? null,
      status: sub.status === "cancelled" ? "canceled" : sub.status,
      mrrCents: sub.status === "cancelled" ? 0 : subscriptionMrr(sub),
      currency: sub.currency ?? "usd",
      interval: sub.payment_frequency_interval?.toLowerCase() ?? null,
      quantity: sub.quantity ?? 1,
      startedAt: dt(sub.created_at),
      canceledAt: dt(sub.cancelled_at),
      metadata: sub.metadata ?? null,
    });
  }

  return persistPull(connectionId, { customers: [...custById.values()], subscriptions: normalized });
}
