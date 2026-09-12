import Stripe from "stripe";
import { db } from "@/db";
import { persistPull, type ProviderPull, type NormalizedCustomer, type NormalizedSubscription } from "./sync-core";

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

const ts = (s: number | null | undefined) => (s ? new Date(s * 1000) : null);

export async function syncConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "stripe") return;

  const stripe = client(conn.apiKey);

  // `status: all` so cancellations are observed rather than inferred from a
  // subscription silently dropping out of the active list.
  const subs: Stripe.Subscription[] = [];
  for await (const sub of stripe.subscriptions.list({
    status: "all", limit: 100, expand: ["data.items.data.price", "data.customer"],
  })) {
    subs.push(sub);
  }

  const custById = new Map<string, NormalizedCustomer>();
  const normalized: NormalizedSubscription[] = [];

  for (const sub of subs) {
    const cust = sub.customer;
    let customerExternalId: string | null = null;

    if (typeof cust === "string") {
      customerExternalId = cust;
    } else if (cust && !cust.deleted) {
      customerExternalId = cust.id;
      custById.set(cust.id, {
        externalId: cust.id,
        email: cust.email ?? null,
        name: cust.name ?? null,
        country: cust.address?.country ?? null,
        signedUpAt: ts(cust.created),
        metadata: cust.metadata ?? null,
      });
    }

    normalized.push({
      externalId: sub.id,
      customerExternalId,
      planName: sub.items.data[0]?.price?.nickname ?? sub.items.data[0]?.price?.id ?? null,
      status: sub.status === "canceled" || sub.status === "incomplete_expired" ? "canceled" : sub.status,
      mrrCents: sub.status === "canceled" ? 0 : subscriptionMrr(sub),
      currency: sub.currency ?? "usd",
      interval: sub.items.data[0]?.price?.recurring?.interval ?? null,
      quantity: sub.items.data[0]?.quantity ?? 1,
      startedAt: ts(sub.start_date ?? sub.created),
      trialStartAt: ts(sub.trial_start),
      trialEndAt: ts(sub.trial_end),
      canceledAt: ts(sub.ended_at ?? sub.canceled_at),
      metadata: sub.metadata ?? null,
    });
  }

  const pull: ProviderPull = { customers: [...custById.values()], subscriptions: normalized };
  return persistPull(connectionId, pull);
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
