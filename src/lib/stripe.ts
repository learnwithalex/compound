import Stripe from "stripe";
import { db } from "@/db";
import { connections, snapshots, revenueEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

function client(apiKey: string) {
  return new Stripe(apiKey, { apiVersion: "2025-02-24.acacia" });
}

// Compute MRR from a Stripe subscription (normalise to monthly cents)
function subscriptionMrr(sub: Stripe.Subscription): number {
  let cents = 0;
  for (const item of sub.items.data) {
    const price = item.price;
    if (!price.unit_amount) continue;
    const qty = item.quantity ?? 1;
    const amount = price.unit_amount * qty;
    switch (price.recurring?.interval) {
      case "month": cents += amount; break;
      case "year":  cents += Math.round(amount / 12); break;
      case "week":  cents += Math.round(amount * 4.333); break;
      case "day":   cents += Math.round(amount * 30); break;
    }
  }
  return cents;
}

export async function syncConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "stripe") return;

  const stripe = client(conn.apiKey);
  const today = new Date().toISOString().slice(0, 10);

  // Fetch all active subscriptions
  const subs: Stripe.Subscription[] = [];
  for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.items.data.price"] })) {
    subs.push(sub);
  }

  const mrrCents = subs.reduce((sum, s) => sum + subscriptionMrr(s), 0);
  const activeSubscriptions = subs.length;

  // Get yesterday's snapshot for delta computation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const prevDate = yesterday.toISOString().slice(0, 10);

  const prevSnap = await db.query.snapshots.findFirst({
    where: (s, { eq, and }) => and(eq(s.connectionId, connectionId), eq(s.date, prevDate)),
  });

  const prevMrr = prevSnap?.mrrCents ?? 0;
  const diff = mrrCents - prevMrr;

  const newMrrCents = diff > 0 ? diff : 0;
  const churnedMrrCents = diff < 0 ? Math.abs(diff) : 0;

  // Upsert today's snapshot
  await db.insert(snapshots).values({
    connectionId,
    date: today,
    mrrCents,
    newMrrCents,
    churnedMrrCents,
    expansionMrrCents: 0,
    contractionMrrCents: 0,
    activeSubscriptions,
  }).onConflictDoUpdate({
    target: [snapshots.connectionId, snapshots.date],
    set: { mrrCents, newMrrCents, churnedMrrCents, activeSubscriptions },
  });

  await db.update(connections)
    .set({ lastSyncedAt: new Date() })
    .where(eq(connections.id, connectionId));

  return { mrrCents, activeSubscriptions };
}

export async function fetchStripeOverview(apiKey: string) {
  const stripe = client(apiKey);
  const subs: Stripe.Subscription[] = [];
  for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.items.data.price"] })) {
    subs.push(sub);
  }
  return {
    mrrCents: subs.reduce((s, sub) => s + subscriptionMrr(sub), 0),
    activeSubscriptions: subs.length,
  };
}
