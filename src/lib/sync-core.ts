import { db } from "@/db";
import { connections, customers, subscriptions, snapshots, revenueEvents } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

/* ============================================================ normalized shapes */

export interface NormalizedCustomer {
  externalId: string;
  email?: string | null;
  name?: string | null;
  country?: string | null;
  signedUpAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

export interface NormalizedSubscription {
  externalId: string;
  customerExternalId?: string | null;
  planName?: string | null;
  status: string; // active | trialing | past_due | canceled
  mrrCents: number;
  currency?: string;
  interval?: string | null;
  quantity?: number;
  startedAt?: Date | null;
  trialStartAt?: Date | null;
  trialEndAt?: Date | null;
  canceledAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

export interface ProviderPull {
  customers: NormalizedCustomer[];
  subscriptions: NormalizedSubscription[];
}

/* ============================================================ helpers */

const MRR_STATUSES = new Set(["active", "past_due"]);

export function monthlyCents(amountCents: number, interval?: string | null, count = 1): number {
  const per = amountCents / (count || 1);
  switch ((interval ?? "month").toLowerCase()) {
    case "year": case "annually": case "yearly": return Math.round(per / 12);
    case "biannually": return Math.round(per / 6);
    case "quarterly": return Math.round(per / 3);
    case "week": case "weekly": return Math.round(per * 4.333);
    case "day": case "daily": return Math.round(per * 30);
    default: return Math.round(per);
  }
}

const UTM_KEYS = {
  utmSource: ["utm_source", "utmSource", "source"],
  utmMedium: ["utm_medium", "utmMedium", "medium"],
  utmCampaign: ["utm_campaign", "utmCampaign", "campaign"],
  referrer: ["referrer", "referer", "ref"],
} as const;

// Attribution only exists if the merchant stamped it onto the provider record.
// Absent keys stay null and surface as "unattributed" rather than being guessed.
export function extractAttribution(metadata?: Record<string, unknown> | null) {
  const out: Record<string, string | null> = {
    utmSource: null, utmMedium: null, utmCampaign: null, referrer: null,
  };
  if (!metadata) return out;
  for (const [field, keys] of Object.entries(UTM_KEYS)) {
    for (const k of keys) {
      const v = metadata[k];
      if (typeof v === "string" && v.trim()) { out[field] = v.trim(); break; }
    }
  }
  return out;
}

/* ============================================================ persist + diff */

export async function persistPull(connectionId: string, pull: ProviderPull) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // 1. Upsert customers, build externalId -> internal id map
  const custIdByExternal = new Map<string, string>();
  for (const c of pull.customers) {
    const attribution = extractAttribution(c.metadata);
    const [row] = await db.insert(customers).values({
      connectionId,
      externalId: c.externalId,
      email: c.email ?? null,
      name: c.name ?? null,
      country: c.country ?? null,
      signedUpAt: c.signedUpAt ?? null,
      ...attribution,
      metadata: c.metadata ? JSON.stringify(c.metadata) : null,
    }).onConflictDoUpdate({
      target: [customers.connectionId, customers.externalId],
      set: {
        email: c.email ?? null,
        name: c.name ?? null,
        country: c.country ?? null,
        signedUpAt: c.signedUpAt ?? null,
      },
    }).returning({ id: customers.id });
    if (row) custIdByExternal.set(c.externalId, row.id);
  }

  // 2. Snapshot previous subscription state so we can diff against it
  const prevSubs = await db.query.subscriptions.findMany({
    where: (s, { eq }) => eq(s.connectionId, connectionId),
  });
  const prevByExternal = new Map(prevSubs.map((s) => [s.externalId, s]));

  const events: typeof revenueEvents.$inferInsert[] = [];
  const seen = new Set<string>();

  // 3. Upsert each subscription and emit the state-change event
  for (const s of pull.subscriptions) {
    seen.add(s.externalId);
    const prev = prevByExternal.get(s.externalId);
    const customerId = s.customerExternalId ? custIdByExternal.get(s.customerExternalId) ?? null : null;

    await db.insert(subscriptions).values({
      connectionId,
      customerId,
      externalId: s.externalId,
      planName: s.planName ?? null,
      status: s.status,
      mrrCents: s.mrrCents,
      currency: s.currency ?? "usd",
      interval: s.interval ?? null,
      quantity: s.quantity ?? 1,
      startedAt: s.startedAt ?? null,
      trialStartAt: s.trialStartAt ?? null,
      trialEndAt: s.trialEndAt ?? null,
      canceledAt: s.canceledAt ?? null,
      metadata: s.metadata ? JSON.stringify(s.metadata) : null,
      lastSeenAt: now,
    }).onConflictDoUpdate({
      target: [subscriptions.connectionId, subscriptions.externalId],
      set: {
        customerId,
        planName: s.planName ?? null,
        status: s.status,
        mrrCents: s.mrrCents,
        quantity: s.quantity ?? 1,
        canceledAt: s.canceledAt ?? null,
        lastSeenAt: now,
      },
    });

    const nowPaying = MRR_STATUSES.has(s.status);
    const wasPaying = prev ? MRR_STATUSES.has(prev.status) : false;

    if (!prev && nowPaying) {
      events.push({ connectionId, externalId: s.externalId, eventType: "new", amountCents: s.mrrCents, currency: s.currency ?? "usd", occurredAt: s.startedAt ?? now });
    } else if (prev && !wasPaying && nowPaying) {
      events.push({ connectionId, externalId: s.externalId, eventType: "reactivation", amountCents: s.mrrCents, currency: s.currency ?? "usd", occurredAt: now });
    } else if (prev && wasPaying && !nowPaying) {
      events.push({ connectionId, externalId: s.externalId, eventType: "churn", amountCents: prev.mrrCents, currency: s.currency ?? "usd", occurredAt: s.canceledAt ?? now });
    } else if (prev && wasPaying && nowPaying && s.mrrCents !== prev.mrrCents) {
      const delta = s.mrrCents - prev.mrrCents;
      events.push({ connectionId, externalId: s.externalId, eventType: delta > 0 ? "expansion" : "contraction", amountCents: Math.abs(delta), currency: s.currency ?? "usd", occurredAt: now });
    }
  }

  // 4. Anything previously paying that vanished from the provider's list churned
  const vanished = prevSubs.filter((p) => !seen.has(p.externalId) && MRR_STATUSES.has(p.status));
  if (vanished.length > 0) {
    await db.update(subscriptions)
      .set({ status: "canceled", canceledAt: now, mrrCents: 0, lastSeenAt: now })
      .where(and(
        eq(subscriptions.connectionId, connectionId),
        inArray(subscriptions.externalId, vanished.map((v) => v.externalId)),
      ));
    for (const v of vanished) {
      events.push({ connectionId, externalId: v.externalId, eventType: "churn", amountCents: v.mrrCents, currency: v.currency, occurredAt: now });
    }
  }

  if (events.length > 0) await db.insert(revenueEvents).values(events);

  // 5. Daily snapshot, with movement now derived from real events rather than
  //    a day-over-day diff of the total.
  const mrrCents = pull.subscriptions
    .filter((s) => MRR_STATUSES.has(s.status))
    .reduce((sum, s) => sum + s.mrrCents, 0);
  const activeSubscriptions = pull.subscriptions.filter((s) => MRR_STATUSES.has(s.status)).length;
  const sumOf = (type: string) => events.filter((e) => e.eventType === type).reduce((s, e) => s + e.amountCents, 0);
  const newMrrCents = sumOf("new") + sumOf("reactivation");
  const churnedMrrCents = sumOf("churn");
  const expansionMrrCents = sumOf("expansion");
  const contractionMrrCents = sumOf("contraction");

  await db.insert(snapshots).values({
    connectionId, date: today, mrrCents, newMrrCents, churnedMrrCents,
    expansionMrrCents, contractionMrrCents, activeSubscriptions,
  }).onConflictDoUpdate({
    target: [snapshots.connectionId, snapshots.date],
    set: { mrrCents, newMrrCents, churnedMrrCents, expansionMrrCents, contractionMrrCents, activeSubscriptions },
  });

  await db.update(connections).set({ lastSyncedAt: now }).where(eq(connections.id, connectionId));

  return { mrrCents, activeSubscriptions, events: events.length };
}
