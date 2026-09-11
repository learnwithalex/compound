import { db } from "@/db";
import { connections, snapshots } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://api.paystack.co";

// Paystack amounts are in kobo (smallest NGN unit). The plan carries the
// billing interval: monthly | annually | biennially | ... Auth: Bearer secret key.
// List: GET /subscription?status=active&perPage=100&page=N (response: { status, data: [...] }).
interface PaystackSubscription {
  status: string; // active | complete | cancelled | attention | ...
  quantity: number;
  plan: {
    name: string;
    amount: number; // kobo
    interval: string; // hourly | daily | weekly | monthly | quarterly | biannually | annually
    interval_count?: number;
  };
}

interface PaystackListResponse {
  status: boolean;
  data: PaystackSubscription[];
  meta: { total: number; page: number; perPage: number; pageCount: number };
}

async function paystackGet<T>(apiKey: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Paystack API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// Normalize to monthly kobo (Compound stores smallest-unit; formatting is $ for now,
// same limitation as Stripe cents — amounts stay comparable per connection).
function subscriptionMrr(sub: PaystackSubscription): number {
  const perPeriod = (sub.plan.amount * Math.max(1, sub.quantity)) / Math.max(1, sub.plan.interval_count ?? 1);
  switch (sub.plan.interval) {
    case "monthly":    return Math.round(perPeriod);
    case "quarterly":  return Math.round(perPeriod / 3);
    case "biannually": return Math.round(perPeriod / 6);
    case "annually":   return Math.round(perPeriod / 12);
    case "weekly":     return Math.round(perPeriod * 4.333);
    case "daily":      return Math.round(perPeriod * 30);
    case "hourly":     return Math.round(perPeriod * 30 * 24);
    default:           return Math.round(perPeriod);
  }
}

async function fetchAllActiveSubs(apiKey: string): Promise<PaystackSubscription[]> {
  const result: PaystackSubscription[] = [];
  let page = 1;
  while (true) {
    const data = await paystackGet<PaystackListResponse>(apiKey, "/subscription", {
      status: "active",
      perPage: "100",
      page: String(page),
    });
    if (!data.status) throw new Error("Paystack API returned status=false");
    result.push(...data.data);
    if (page >= data.meta.pageCount || data.data.length === 0) break;
    page++;
  }
  return result;
}

export async function fetchPaystackOverview(apiKey: string): Promise<{ mrrCents: number; activeSubscriptions: number }> {
  const subs = await fetchAllActiveSubs(apiKey);
  return {
    mrrCents: subs.reduce((s, sub) => s + subscriptionMrr(sub), 0),
    activeSubscriptions: subs.length,
  };
}

export async function syncPaystackConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "paystack") return;

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
