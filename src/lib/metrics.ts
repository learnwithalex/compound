import { db } from "@/db";
import { snapshots } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface ProductMetrics {
  connectionId: string;
  label: string;
  color: string;
  provider: string;
  mrrCents: number;
  arrCents: number;
  churnedMrrCents: number;
  newMrrCents: number;
  expansionMrrCents: number;
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

  const since = new Date();
  since.setDate(since.getDate() - 31);
  const sinceStr = since.toISOString().slice(0, 10);

  const products: ProductMetrics[] = [];

  for (const conn of connections) {
    const snaps = await db.query.snapshots.findMany({
      where: (s, { eq, and, gte }) => and(eq(s.connectionId, conn.id), gte(s.date, sinceStr)),
      orderBy: (s, { asc }) => [asc(s.date)],
    });

    if (snaps.length === 0) {
      products.push({
        connectionId: conn.id,
        label: conn.label,
        color: conn.color,
        provider: conn.provider,
        mrrCents: 0,
        arrCents: 0,
        churnedMrrCents: 0,
        newMrrCents: 0,
        expansionMrrCents: 0,
        activeSubscriptions: 0,
        mrrChange30d: 0,
        history: [],
      });
      continue;
    }

    const latest = snaps[snaps.length - 1];
    const oldest = snaps[0];
    const mrrChange30d = oldest.mrrCents > 0
      ? ((latest.mrrCents - oldest.mrrCents) / oldest.mrrCents) * 100
      : 0;

    // Sum movement over last 30d
    const newMrrCents = snaps.reduce((s, r) => s + r.newMrrCents, 0);
    const churnedMrrCents = snaps.reduce((s, r) => s + r.churnedMrrCents, 0);
    const expansionMrrCents = snaps.reduce((s, r) => s + r.expansionMrrCents, 0);

    products.push({
      connectionId: conn.id,
      label: conn.label,
      color: conn.color,
      provider: conn.provider,
      mrrCents: latest.mrrCents,
      arrCents: latest.mrrCents * 12,
      churnedMrrCents,
      newMrrCents,
      expansionMrrCents,
      activeSubscriptions: latest.activeSubscriptions,
      mrrChange30d,
      history: snaps.map((s) => ({ date: s.date, mrrCents: s.mrrCents })),
    });
  }

  const totalMrrCents = products.reduce((s, p) => s + p.mrrCents, 0);
  const netNewMrrCents = products.reduce((s, p) => s + p.newMrrCents + p.expansionMrrCents - p.churnedMrrCents, 0);

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

  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceStr = since.toISOString().slice(0, 10);

  const snaps = await db.query.snapshots.findMany({
    where: (s, { eq, and, gte }) => and(eq(s.connectionId, conn.id), gte(s.date, sinceStr)),
    orderBy: (s, { asc }) => [asc(s.date)],
  });

  if (snaps.length === 0) {
    return {
      product: {
        connectionId: conn.id,
        label: conn.label,
        color: conn.color,
        provider: conn.provider,
        mrrCents: 0,
        arrCents: 0,
        churnedMrrCents: 0,
        newMrrCents: 0,
        expansionMrrCents: 0,
        activeSubscriptions: 0,
        mrrChange30d: 0,
        history: [],
      },
      lastSyncedAt: conn.lastSyncedAt,
      currency: conn.currency,
    };
  }

  const latest = snaps[snaps.length - 1];
  const oldest = snaps[0];
  const mrrChange30d = oldest.mrrCents > 0
    ? ((latest.mrrCents - oldest.mrrCents) / oldest.mrrCents) * 100
    : 0;

  return {
    product: {
      connectionId: conn.id,
      label: conn.label,
      color: conn.color,
      provider: conn.provider,
      mrrCents: latest.mrrCents,
      arrCents: latest.mrrCents * 12,
      churnedMrrCents: snaps.reduce((s, r) => s + r.churnedMrrCents, 0),
      newMrrCents: snaps.reduce((s, r) => s + r.newMrrCents, 0),
      expansionMrrCents: snaps.reduce((s, r) => s + r.expansionMrrCents, 0),
      activeSubscriptions: latest.activeSubscriptions,
      mrrChange30d,
      history: snaps.map((s) => ({ date: s.date, mrrCents: s.mrrCents })),
    },
    lastSyncedAt: conn.lastSyncedAt,
    currency: conn.currency,
  };
}

export { fmtMrr, fmtDollars } from "./format";
