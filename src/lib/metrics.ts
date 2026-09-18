import { db } from "@/db";
import { snapshots } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

type Snap = { date: string; mrrCents: number; newMrrCents: number; churnedMrrCents: number; expansionMrrCents: number; contractionMrrCents: number };

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** The 30-day figures, derived from however wide a window the caller loaded.
 *  Shared so the portfolio and the product page cannot disagree about the same
 *  product — they did, because one summed 30 days of snapshots and the other 90. */
export function movement30d(snaps: Snap[]) {
  const cutoff = daysAgo(31);
  const recent = snaps.filter((s) => s.date >= cutoff);
  const window = recent.length > 0 ? recent : snaps;
  const first = window[0];
  const latest = snaps[snaps.length - 1];

  return {
    mrrChange30d: first.mrrCents > 0 ? ((latest.mrrCents - first.mrrCents) / first.mrrCents) * 100 : 0,
    newMrrCents: window.reduce((s, r) => s + r.newMrrCents, 0),
    churnedMrrCents: window.reduce((s, r) => s + r.churnedMrrCents, 0),
    expansionMrrCents: window.reduce((s, r) => s + r.expansionMrrCents, 0),
    contractionMrrCents: window.reduce((s, r) => s + r.contractionMrrCents, 0),
  };
}

export interface ProductMetrics {
  connectionId: string;
  label: string;
  color: string;
  provider: string;
  websiteUrl: string | null;
  iconUrl: string | null;
  mrrCents: number;
  arrCents: number;
  churnedMrrCents: number;
  newMrrCents: number;
  expansionMrrCents: number;
  contractionMrrCents: number;
  pastDueMrrCents: number;
  activeSubscriptions: number;
  mrrChange30d: number; // percentage
  history: { date: string; mrrCents: number }[];
}

export interface PortfolioMetrics {
  totalMrrCents: number;
  totalArrCents: number;
  totalActiveSubscriptions: number;
  netNewMrrCents: number;
  products: ProductMetrics[];
}

export async function portfolioMetrics(userId: string): Promise<PortfolioMetrics> {
  const connections = await db.query.connections.findMany({
    where: (c, { eq }) => eq(c.userId, userId),
  });

  const sinceStr = daysAgo(31);

  const products: ProductMetrics[] = [];

  for (const conn of connections) {
    const [snaps, pastDueSubs] = await Promise.all([
      db.query.snapshots.findMany({
        where: (s, { eq, and, gte }) => and(eq(s.connectionId, conn.id), gte(s.date, sinceStr)),
        orderBy: (s, { asc }) => [asc(s.date)],
      }),
      db.query.subscriptions.findMany({
        where: (s, { eq, and }) => and(eq(s.connectionId, conn.id), eq(s.status, "past_due")),
      }),
    ]);

    const pastDueMrrCents = pastDueSubs.reduce((s, x) => s + x.mrrCents, 0);

    if (snaps.length === 0) {
      products.push({
        connectionId: conn.id,
        label: conn.label,
        color: conn.color,
        provider: conn.provider,
        websiteUrl: conn.websiteUrl ?? null,
        iconUrl: conn.iconUrl ?? null,
        mrrCents: 0,
        arrCents: 0,
        churnedMrrCents: 0,
        newMrrCents: 0,
        expansionMrrCents: 0,
        contractionMrrCents: 0,
        pastDueMrrCents,
        activeSubscriptions: 0,
        mrrChange30d: 0,
        history: [],
      });
      continue;
    }

    const latest = snaps[snaps.length - 1];

    products.push({
      connectionId: conn.id,
      label: conn.label,
      color: conn.color,
      provider: conn.provider,
      websiteUrl: conn.websiteUrl ?? null,
      iconUrl: conn.iconUrl ?? null,
      mrrCents: latest.mrrCents,
      arrCents: latest.mrrCents * 12,
      activeSubscriptions: latest.activeSubscriptions,
      pastDueMrrCents,
      ...movement30d(snaps),
      history: snaps.map((s) => ({ date: s.date, mrrCents: s.mrrCents })),
    });
  }

  const totalMrrCents = products.reduce((s, p) => s + p.mrrCents, 0);
  const netNewMrrCents = products.reduce((s, p) => s + p.newMrrCents + p.expansionMrrCents - p.churnedMrrCents - p.contractionMrrCents, 0);

  return {
    totalMrrCents,
    totalArrCents: totalMrrCents * 12,
    totalActiveSubscriptions: products.reduce((s, p) => s + p.activeSubscriptions, 0),
    netNewMrrCents,
    products,
  };
}

export async function singleProductMetrics(
  userId: string,
  connectionId: string,
): Promise<{ product: ProductMetrics; lastSyncedAt: Date | null; currency: string } | null> {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq, and }) => and(eq(c.userId, userId), eq(c.id, connectionId)),
  });
  if (!conn) return null;

  const sinceStr = daysAgo(90);

  const [snaps, pastDueSubs] = await Promise.all([
    db.query.snapshots.findMany({
      where: (s, { eq, and, gte }) => and(eq(s.connectionId, conn.id), gte(s.date, sinceStr)),
      orderBy: (s, { asc }) => [asc(s.date)],
    }),
    db.query.subscriptions.findMany({
      where: (s, { eq, and }) => and(eq(s.connectionId, conn.id), eq(s.status, "past_due")),
    }),
  ]);

  const pastDueMrrCents = pastDueSubs.reduce((s, x) => s + x.mrrCents, 0);

  if (snaps.length === 0) {
    return {
      product: {
        connectionId: conn.id,
        label: conn.label,
        color: conn.color,
        provider: conn.provider,
        websiteUrl: conn.websiteUrl ?? null,
        iconUrl: conn.iconUrl ?? null,
        mrrCents: 0,
        arrCents: 0,
        churnedMrrCents: 0,
        newMrrCents: 0,
        expansionMrrCents: 0,
        contractionMrrCents: 0,
        pastDueMrrCents,
        activeSubscriptions: 0,
        mrrChange30d: 0,
        history: [],
      },
      lastSyncedAt: conn.lastSyncedAt,
      currency: conn.currency,
    };
  }

  const latest = snaps[snaps.length - 1];

  return {
    product: {
      connectionId: conn.id,
      label: conn.label,
      color: conn.color,
      provider: conn.provider,
      websiteUrl: conn.websiteUrl ?? null,
      iconUrl: conn.iconUrl ?? null,
      mrrCents: latest.mrrCents,
      arrCents: latest.mrrCents * 12,
      activeSubscriptions: latest.activeSubscriptions,
      pastDueMrrCents,
      // 30-day figures, even though `snaps` spans 90 days for the chart.
      ...movement30d(snaps),
      history: snaps.map((s) => ({ date: s.date, mrrCents: s.mrrCents })),
    },
    lastSyncedAt: conn.lastSyncedAt,
    currency: conn.currency,
  };
}

export { fmtMrr, fmtDollars } from "./format";
