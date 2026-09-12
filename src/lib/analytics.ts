import { db } from "@/db";
import { productIcon } from "@/lib/format";

/* ============================================================ shared load */

const PAYING = new Set(["active", "past_due"]);

export interface LoadedSub {
  connectionId: string;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  planName: string | null;
  status: string;
  mrrCents: number;
  startedAt: Date | null;
  trialEndAt: Date | null;
  canceledAt: Date | null;
  country: string | null;
  utmSource: string | null;
  provider: string;
  productLabel: string;
}

export async function loadSubs(userId: string, connectionId?: string): Promise<LoadedSub[]> {
  const conns = await db.query.connections.findMany({
    where: (c, { eq }) => eq(c.userId, userId),
  });
  const wanted = connectionId ? conns.filter((c) => c.id === connectionId) : conns;
  if (wanted.length === 0) return [];
  const byId = new Map(wanted.map((c) => [c.id, c]));

  const ids = wanted.map((c) => c.id);
  const subs = await db.query.subscriptions.findMany({
    where: (s, { inArray }) => inArray(s.connectionId, ids),
  });
  const custIds = [...new Set(subs.map((s) => s.customerId).filter((x): x is string => !!x))];
  const custs = custIds.length
    ? await db.query.customers.findMany({ where: (c, { inArray }) => inArray(c.id, custIds) })
    : [];
  const custById = new Map(custs.map((c) => [c.id, c]));

  return subs.map((s) => {
    const c = s.customerId ? custById.get(s.customerId) : undefined;
    const conn = byId.get(s.connectionId)!;
    return {
      connectionId: s.connectionId,
      customerId: s.customerId,
      customerName: c?.name ?? null,
      customerEmail: c?.email ?? null,
      planName: s.planName,
      status: s.status,
      mrrCents: s.mrrCents,
      startedAt: s.startedAt,
      trialEndAt: s.trialEndAt,
      canceledAt: s.canceledAt,
      country: c?.country ?? null,
      utmSource: c?.utmSource ?? null,
      provider: conn.provider,
      productLabel: conn.label,
    };
  });
}

/* ============================================================ month helpers */

/**
 * A trial cancelled on or before its end date never produced a payment, so it
 * must stay out of MRR-denominated math (cohorts, churn, quick ratio).
 */
export const lapsedTrial = (s: LoadedSub) =>
  !!(s.canceledAt && s.trialEndAt && s.canceledAt <= s.trialEndAt);

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const monthDiff = (a: Date, b: Date) =>
  (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
function endOfMonthAfter(from: Date, offset: number): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + offset + 1, 1));
  return new Date(d.getTime() - 1);
}

/* ============================================================ cohort retention */

export interface CohortRow {
  cohort: string;
  label: string;
  customers: number;
  startMrrCents: number;
  retention: (number | null)[]; // percent, null = month hasn't elapsed yet
}

/**
 * Monthly cohorts by subscription start, measuring MRR retained at each
 * subsequent month end. Mid-life plan changes aren't tracked yet, so a
 * subscription contributes its current MRR for its whole lifetime.
 */
export function cohortRetention(subs: LoadedSub[], maxOffset = 12): CohortRow[] {
  const withStart = subs.filter((s) => s.startedAt && !lapsedTrial(s));
  if (withStart.length === 0) return [];

  const now = new Date();
  const groups = new Map<string, LoadedSub[]>();
  for (const s of withStart) {
    const k = monthKey(s.startedAt!);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s);
  }

  const rows: CohortRow[] = [];
  for (const [cohort, members] of [...groups.entries()].sort()) {
    const anchor = new Date(`${cohort}-01T00:00:00Z`);
    const elapsed = monthDiff(anchor, now);
    // Value of the cohort at signup. Canceled rows carry mrrCents 0, so fall
    // back to the sibling median rather than under-counting the denominator.
    const startMrrCents = members.reduce((sum, m) => sum + startValue(m, members), 0);
    if (startMrrCents === 0) continue;

    const retention: (number | null)[] = [];
    for (let k = 0; k <= maxOffset; k++) {
      if (k > elapsed) { retention.push(null); continue; }
      const at = endOfMonthAfter(anchor, k);
      const alive = members.reduce(
        (sum, m) => sum + (!m.canceledAt || m.canceledAt > at ? startValue(m, members) : 0), 0,
      );
      retention.push((alive / startMrrCents) * 100);
    }

    rows.push({
      cohort,
      label: anchor.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
      customers: members.length,
      startMrrCents,
      retention,
    });
  }
  return rows;
}

function startValue(s: LoadedSub, peers: LoadedSub[]): number {
  if (s.mrrCents > 0) return s.mrrCents;
  const live = peers.filter((p) => p.mrrCents > 0).map((p) => p.mrrCents).sort((a, b) => a - b);
  return live.length ? live[Math.floor(live.length / 2)] : 0;
}

/* ============================================================ headline metrics */

export interface CoreMetrics {
  mrrCents: number;
  activeCustomers: number;
  arpaCents: number;
  monthlyChurnPct: number;
  avgLifetimeMonths: number;
  ltvCents: number;
  quickRatio: number | null;
  newMrr30dCents: number;
  churnedMrr30dCents: number;
}

export function coreMetrics(subs: LoadedSub[]): CoreMetrics {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 864e5);

  const active = subs.filter((s) => PAYING.has(s.status));
  const mrrCents = active.reduce((s, x) => s + x.mrrCents, 0);
  const activeCustomers = active.length;
  const arpaCents = activeCustomers ? Math.round(mrrCents / activeCustomers) : 0;

  // Lapsed trials never billed, so they are not churn and not new revenue.
  const paid = subs.filter((s) => !lapsedTrial(s));
  const churned30 = paid.filter((s) => s.canceledAt && s.canceledAt >= d30);
  const new30 = paid.filter((s) => s.startedAt && s.startedAt >= d30);

  // Denominator is the population that existed 30 days ago.
  const activeAt30 = paid.filter(
    (s) => s.startedAt && s.startedAt < d30 && (!s.canceledAt || s.canceledAt >= d30),
  ).length;
  const monthlyChurnPct = activeAt30 ? (churned30.length / activeAt30) * 100 : 0;
  const avgLifetimeMonths = monthlyChurnPct > 0 ? 100 / monthlyChurnPct : 0;
  const ltvCents = Math.round(arpaCents * avgLifetimeMonths);

  const medianMrr = (() => {
    const v = active.map((s) => s.mrrCents).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : 0;
  })();
  const newMrr30dCents = new30.reduce((s, x) => s + (x.mrrCents || medianMrr), 0);
  const churnedMrr30dCents = churned30.reduce((s, x) => s + (x.mrrCents || medianMrr), 0);
  const quickRatio = churnedMrr30dCents > 0 ? newMrr30dCents / churnedMrr30dCents : null;

  return {
    mrrCents, activeCustomers, arpaCents, monthlyChurnPct,
    avgLifetimeMonths, ltvCents, quickRatio, newMrr30dCents, churnedMrr30dCents,
  };
}

/* ============================================================ segments */

export interface Segment {
  key: string;
  customers: number;
  mrrCents: number;
  pct: number;
  /** Product segments only — the others are drawn from a glyph set instead. */
  icon?: string;
}

function segmentBy(subs: LoadedSub[], keyOf: (s: LoadedSub) => string): Segment[] {
  const active = subs.filter((s) => PAYING.has(s.status));
  const total = active.reduce((s, x) => s + x.mrrCents, 0) || 1;
  const map = new Map<string, { customers: number; mrrCents: number }>();
  for (const s of active) {
    const k = keyOf(s);
    const cur = map.get(k) ?? { customers: 0, mrrCents: 0 };
    cur.customers++; cur.mrrCents += s.mrrCents;
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v, pct: (v.mrrCents / total) * 100 }))
    .sort((a, b) => b.mrrCents - a.mrrCents);
}

export const segmentByPlan = (s: LoadedSub[]) => segmentBy(s, (x) => x.planName ?? "Unknown");
export const segmentByCountry = (s: LoadedSub[]) => segmentBy(s, (x) => x.country ?? "Unknown");
export const segmentByProduct = (s: LoadedSub[]) =>
  segmentBy(s, (x) => x.productLabel).map((seg) => ({
    ...seg,
    icon: productIcon(seg.key, s.find((x) => x.productLabel === seg.key)?.provider ?? ""),
  }));
// Null source means the merchant never stamped attribution onto the record —
// reported as Unattributed rather than being inferred.
export const segmentBySource = (s: LoadedSub[]) => segmentBy(s, (x) => x.utmSource ?? "Unattributed");

/* ============================================================ customers */

export interface TopCustomer {
  name: string;
  email: string | null;
  planName: string | null;
  country: string | null;
  source: string | null;
  mrrCents: number;
  tenureMonths: number;
  /** Revenue billed to date, at the current rate. */
  ltdCents: number;
}

export function topCustomers(subs: LoadedSub[], limit = 10): TopCustomer[] {
  const now = Date.now();
  return subs
    .filter((s) => PAYING.has(s.status))
    .sort((a, b) => b.mrrCents - a.mrrCents)
    .slice(0, limit)
    .map((s) => {
      const months = s.startedAt ? (now - s.startedAt.getTime()) / (30.44 * 864e5) : 0;
      return {
        name: s.customerName ?? s.customerEmail ?? "Unknown",
        email: s.customerEmail,
        planName: s.planName,
        country: s.country,
        source: s.utmSource,
        mrrCents: s.mrrCents,
        tenureMonths: months,
        ltdCents: Math.round(s.mrrCents * months),
      };
    });
}

/* ============================================================ activity feed */

export interface ActivityItem {
  eventType: string;
  amountCents: number;
  occurredAt: Date;
  customerName: string;
  planName: string | null;
}

/** Most recent revenue movements, named. Drives the product activity feed. */
export async function recentActivity(connectionId: string, limit = 12): Promise<ActivityItem[]> {
  const events = await db.query.revenueEvents.findMany({
    where: (e, { eq }) => eq(e.connectionId, connectionId),
    orderBy: (e, { desc }) => [desc(e.occurredAt)],
    limit,
  });
  if (events.length === 0) return [];

  const extIds = [...new Set(events.map((e) => e.externalId).filter((x): x is string => !!x))];
  const subs = extIds.length
    ? await db.query.subscriptions.findMany({
        where: (s, { and, eq, inArray }) =>
          and(eq(s.connectionId, connectionId), inArray(s.externalId, extIds)),
      })
    : [];
  const subByExt = new Map(subs.map((s) => [s.externalId, s]));

  const custIds = [...new Set(subs.map((s) => s.customerId).filter((x): x is string => !!x))];
  const custs = custIds.length
    ? await db.query.customers.findMany({ where: (c, { inArray }) => inArray(c.id, custIds) })
    : [];
  const custById = new Map(custs.map((c) => [c.id, c]));

  return events.map((e) => {
    const sub = e.externalId ? subByExt.get(e.externalId) : undefined;
    const cust = sub?.customerId ? custById.get(sub.customerId) : undefined;
    return {
      eventType: e.eventType,
      amountCents: e.amountCents,
      occurredAt: e.occurredAt,
      customerName: cust?.name ?? cust?.email ?? "Unknown customer",
      planName: sub?.planName ?? null,
    };
  });
}

/* ============================================================ lifecycle funnel */

export interface FunnelStep { label: string; count: number; pct: number }

export function lifecycleFunnel(subs: LoadedSub[]): FunnelStep[] {
  const total = subs.length || 1;
  const everPaid = subs.filter((s) => !lapsedTrial(s) && s.status !== "trialing").length;
  const stillActive = subs.filter((s) => PAYING.has(s.status)).length;
  const past90 = subs.filter(
    (s) => PAYING.has(s.status) && s.startedAt && Date.now() - s.startedAt.getTime() > 90 * 864e5,
  ).length;
  return [
    { label: "Signed up", count: subs.length, pct: 100 },
    { label: "Converted to paid", count: everPaid, pct: (everPaid / total) * 100 },
    { label: "Still active", count: stillActive, pct: (stillActive / total) * 100 },
    { label: "Retained 90+ days", count: past90, pct: (past90 / total) * 100 },
  ];
}
