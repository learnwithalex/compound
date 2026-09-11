// Stripe revenue ingestion.
//
// v1 uses a platform secret key (STRIPE_SECRET_KEY, test mode) pointed at
// the founder's own account. OAuth (Connect) replaces this once a second
// founder onboards. Two passes:
//
//  1. Balance transactions (charges, refunds, fees) → SourceTransactions
//     with kind context in `raw`. Fees post to 5710 at categorisation time.
//  2. Payouts → matched against Plaid bank deposits at reconciliation time
//     (see lib/reconcile.ts). Payout rows land as source txns with
//     externalId `po_<id>` so matching is a join, not a guess.

import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, sourceConnections, sourceTransactions } from "@/db";
import { encryptToken } from "./plaid";

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function ensureStripeConnection(orgId: string, accountId: string) {
  const existing = await db.query.sourceConnections.findFirst({
    where: (c, { and, eq }) =>
      and(eq(c.orgId, orgId), eq(c.kind, "STRIPE"), eq(c.externalId, accountId)),
  });
  if (existing) return existing;
  const [row] = await db
    .insert(sourceConnections)
    .values({
      orgId,
      kind: "STRIPE",
      externalId: accountId,
      accessToken: encryptToken(process.env.STRIPE_SECRET_KEY!),
    })
    .returning();
  return row;
}

interface StripeSyncResult {
  balanceTxns: number;
  payouts: number;
}

export async function syncStripe(
  orgId: string,
  opts: { days?: number } = {},
): Promise<StripeSyncResult> {
  const client = stripe();
  const account = await client.accounts.retrieve();
  const connection = await ensureStripeConnection(orgId, account.id);

  const since = Math.floor(Date.now() / 1000) - (opts.days ?? 90) * 86400;
  let balanceTxns = 0;
  let payouts = 0;

  for await (const bt of client.balanceTransactions.list({ created: { gte: since }, limit: 100 })) {
    const netCents = bt.net;
    await db
      .insert(sourceTransactions)
      .values({
        orgId,
        connectionId: connection.id,
        externalId: `bt_${bt.id}`,
        occurredAt: new Date(bt.created * 1000),
        amountCents: netCents,
        currency: bt.currency.toUpperCase(),
        merchant: "Stripe",
        description: bt.description ?? `${bt.type} ${bt.id}`,
        raw: { stripeType: bt.type, gross: bt.amount, ...bt },
      })
      .onConflictDoNothing();
    balanceTxns++;
  }

  for await (const po of client.payouts.list({ created: { gte: since }, limit: 100 })) {
    await db
      .insert(sourceTransactions)
      .values({
        orgId,
        connectionId: connection.id,
        externalId: `po_${po.id}`,
        occurredAt: new Date((po.arrival_date ?? po.created) * 1000),
        amountCents: po.amount,
        currency: po.currency.toUpperCase(),
        merchant: "Stripe Payout",
        description: `Stripe payout ${po.id}`,
        raw: { stripeType: "payout", ...po },
      })
      .onConflictDoNothing();
    payouts++;
  }

  await db
    .update(sourceConnections)
    .set({ lastSyncedAt: new Date() })
    .where(eq(sourceConnections.id, connection.id));

  return { balanceTxns, payouts };
}
