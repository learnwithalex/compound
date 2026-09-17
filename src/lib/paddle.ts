import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { db } from "@/db";
import { persistPull, monthlyCents, type ProviderPull, type NormalizedCustomer, type NormalizedSubscription } from "./sync-core";

function client(apiKey: string) {
  const environment = apiKey.startsWith("test_") ? Environment.sandbox : Environment.production;
  return new Paddle(apiKey, { environment });
}

// amount is a string in smallest currency unit (e.g. "1000" = $10.00)
function paddleMrr(unitAmountStr: string, quantity: number, interval: string, frequency: number): number {
  const unitCents = parseInt(unitAmountStr, 10);
  if (isNaN(unitCents) || unitCents <= 0) return 0;
  const totalCents = unitCents * quantity;
  // frequency=3, interval=month → quarterly → divide by 3
  switch (interval) {
    case "year":  return Math.round(totalCents / (12 * frequency));
    case "month": return Math.round(totalCents / frequency);
    case "week":  return Math.round((totalCents / frequency) * 4.333);
    case "day":   return Math.round((totalCents / frequency) * 30);
    default:      return totalCents;
  }
}

export async function syncPaddleConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "paddle") return;

  const paddle = client(conn.apiKey);

  // Fetch customers (paginate all)
  const custMap = new Map<string, NormalizedCustomer>();
  for await (const c of paddle.customers.list({ perPage: 200 })) {
    custMap.set(c.id, {
      externalId: c.id,
      email: c.email ?? null,
      name: c.name ?? null,
      signedUpAt: c.createdAt ? new Date(c.createdAt) : null,
    });
  }

  // Fetch all subscriptions across all statuses
  const statuses = ["active", "canceled", "past_due", "paused", "trialing"] as const;
  const allSubs: NormalizedSubscription[] = [];
  const seenIds = new Set<string>();

  for (const status of statuses) {
    for await (const sub of paddle.subscriptions.list({ status: [status], perPage: 200 })) {
      if (seenIds.has(sub.id)) continue;
      seenIds.add(sub.id);

      // Ensure the customer is mapped
      if (!custMap.has(sub.customerId)) {
        try {
          const c = await paddle.customers.get(sub.customerId);
          custMap.set(c.id, {
            externalId: c.id,
            email: c.email ?? null,
            name: c.name ?? null,
            signedUpAt: c.createdAt ? new Date(c.createdAt) : null,
          });
        } catch {}
      }

      const item = sub.items[0];
      const billing = sub.billingCycle;
      let mrrCents = 0;
      let planName: string | null = null;
      let interval: string | null = null;
      let quantity = 1;

      if (item) {
        quantity = item.quantity ?? 1;
        planName = item.price?.name ?? item.product?.name ?? null;
        const bc = billing ?? item.price?.billingCycle;
        if (bc) {
          interval = bc.interval;
          const paying = sub.status === "active" || sub.status === "past_due" || sub.status === "trialing";
          if (paying) {
            mrrCents = paddleMrr(item.price.unitPrice.amount, quantity, bc.interval, bc.frequency);
          }
        }
      }

      const normalStatus =
        sub.status === "canceled" ? "canceled" :
        sub.status === "paused" ? "canceled" :
        sub.status === "trialing" ? "trialing" :
        sub.status === "past_due" ? "past_due" :
        "active";

      allSubs.push({
        externalId: sub.id,
        customerExternalId: sub.customerId ?? null,
        planName,
        status: normalStatus,
        mrrCents,
        currency: sub.currencyCode?.toLowerCase() ?? "usd",
        interval,
        quantity,
        startedAt: sub.startedAt ? new Date(sub.startedAt) : null,
        trialStartAt: item?.trialDates?.startsAt ? new Date(item.trialDates.startsAt) : null,
        trialEndAt: item?.trialDates?.endsAt ? new Date(item.trialDates.endsAt) : null,
        canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : null,
        metadata: sub.customData ? (sub.customData as Record<string, unknown>) : null,
      });
    }
  }

  const pull: ProviderPull = {
    customers: Array.from(custMap.values()),
    subscriptions: allSubs,
  };

  return persistPull(connectionId, pull);
}
