import { db } from "@/db";
import { connections, snapshots } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function syncPolarConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "polar") return;

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
