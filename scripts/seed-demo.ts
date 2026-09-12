/**
 * Seed demo data: one user + 3 products with 18 months of customer-level history.
 *
 * Customers and subscriptions are simulated first; daily snapshots and revenue
 * events are then DERIVED from that subscription lifecycle, so the dashboard
 * headline MRR and the cohort/LTV reports are guaranteed to agree.
 *
 * Usage: npx tsx scripts/seed-demo.ts [email]
 */
import { db } from "../src/db";
import { users, connections, snapshots, sessions, customers, subscriptions, revenueEvents } from "../src/db/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

const EMAIL = process.argv[2] ?? "demo@compound.so";
const MONTHS = 18;

type Tier = { cents: number; name: string; weight: number };

const TRIAL_DAYS = 14;

const PRODUCTS: {
  label: string; provider: string; color: string; apiKey: string;
  targetActiveSubs: number; monthlyGrowth: number; monthlyChurn: number;
  trialRate: number; trialConversion: number; tiers: Tier[];
}[] = [
  {
    label: "Event Organizer", provider: "stripe", color: "#5e6ad2", apiKey: "sk_demo_event_organizer",
    targetActiveSubs: 2104, monthlyGrowth: 1.051, monthlyChurn: 0.030,
    trialRate: 0.8, trialConversion: 0.62,
    tiers: [
      { cents: 1900, name: "Starter", weight: 4 },
      { cents: 4900, name: "Pro", weight: 4 },
      { cents: 9900, name: "Team", weight: 2 },
      { cents: 19900, name: "Business", weight: 1 },
    ],
  },
  {
    label: "BetterFlow", provider: "stripe", color: "#e8a838", apiKey: "sk_demo_betterflow",
    targetActiveSubs: 680, monthlyGrowth: 1.11, monthlyChurn: 0.050,
    trialRate: 0.9, trialConversion: 0.41,
    tiers: [
      { cents: 500, name: "Hobby", weight: 4 },
      { cents: 900, name: "Solo", weight: 4 },
      { cents: 1900, name: "Plus", weight: 2 },
      { cents: 4900, name: "Studio", weight: 1 },
    ],
  },
  {
    label: "Obsidian Sync Free", provider: "lemonsqueezy", color: "#e54d2e", apiKey: "lsq_demo_obsidian_sync",
    targetActiveSubs: 63, monthlyGrowth: 0.962, monthlyChurn: 0.090,
    trialRate: 0.5, trialConversion: 0.34,
    tiers: [
      { cents: 1900, name: "Sync Basic", weight: 4 },
      { cents: 3900, name: "Sync Plus", weight: 4 },
      { cents: 7900, name: "Sync Pro", weight: 2 },
    ],
  },
];

// Roughly two thirds attributed — the rest stay null so the acquisition report
// shows an honest "unattributed" bucket instead of pretending full coverage.
const SOURCES: ({ source: string; medium: string; campaign: string } | null)[] = [
  { source: "google", medium: "organic", campaign: "seo" },
  { source: "producthunt", medium: "referral", campaign: "launch" },
  { source: "twitter", medium: "social", campaign: "build-in-public" },
  { source: "google", medium: "cpc", campaign: "brand-search" },
  { source: "hackernews", medium: "referral", campaign: "show-hn" },
  { source: "newsletter", medium: "email", campaign: "weekly" },
  { source: "reddit", medium: "social", campaign: "r-saas" },
  null, null, null, null,
];

const COUNTRIES = ["US", "US", "US", "GB", "DE", "CA", "AU", "FR", "NL", "IN", "BR", "NG", "SE", "JP"];
const FIRST = ["Alex", "Sam", "Jordan", "Casey", "Riley", "Morgan", "Taylor", "Jamie", "Avery", "Quinn", "Devin", "Rowan", "Skyler", "Emerson", "Hayden", "Kai", "Noor", "Zara", "Luca", "Mateo"];
const LAST = ["Okafor", "Chen", "Patel", "Silva", "Novak", "Ahmed", "Kim", "Muller", "Rossi", "Dubois", "Larsen", "Costa", "Nakamura", "Bakker", "Adeyemi", "Torres", "Haddad", "Volkov", "Bianchi", "Fischer"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function weightedTier(tiers: Tier[]): Tier {
  const total = tiers.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of tiers) { r -= t.weight; if (r <= 0) return t; }
  return tiers[tiers.length - 1];
}

// Month index 0 = MONTHS-1 months ago, MONTHS-1 = current month.
function monthStart(idx: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - (MONTHS - 1 - idx));
  return d;
}

function randomDayIn(idx: number): Date {
  const start = monthStart(idx);
  const next = new Date(start); next.setUTCMonth(next.getUTCMonth() + 1);
  const span = next.getTime() - start.getTime();
  const t = start.getTime() + Math.random() * span;
  return new Date(Math.min(t, Date.now()));
}

interface SimSub {
  customer: { externalId: string; email: string; name: string; country: string; signedUpAt: Date; utm: typeof SOURCES[number] };
  externalId: string;
  planName: string;
  mrrCents: number;
  startedAt: Date;
  trialStartAt: Date | null;
  trialEndAt: Date | null;
  canceledAt: Date | null;
  /** Trial that lapsed without a payment — never contributes MRR. */
  failedTrial: boolean;
}

function simulate(p: typeof PRODUCTS[number]): SimSub[] {
  // Solve for the signup volume that lands on the target surviving count.
  let weightSum = 0;
  for (let m = 0; m < MONTHS; m++) {
    weightSum += Math.pow(p.monthlyGrowth, m) * Math.pow(1 - p.monthlyChurn, MONTHS - 1 - m);
  }
  // Signups include trials that never convert, so scale up to still land on target.
  const paidShare = 1 - p.trialRate * (1 - p.trialConversion);
  const base = p.targetActiveSubs / (weightSum * paidShare);

  const out: SimSub[] = [];
  let n = 0;
  for (let m = 0; m < MONTHS; m++) {
    const count = Math.max(1, Math.round(base * Math.pow(p.monthlyGrowth, m)));
    for (let i = 0; i < count; i++) {
      const signedUpAt = randomDayIn(m);
      const onTrial = Math.random() < p.trialRate;
      const trialStartAt = onTrial ? signedUpAt : null;
      const trialEndAt = onTrial ? new Date(signedUpAt.getTime() + TRIAL_DAYS * 864e5) : null;
      const failedTrial = onTrial && Math.random() >= p.trialConversion;

      let canceledAt: Date | null = null;
      if (failedTrial) {
        canceledAt = trialEndAt!;
      } else {
        // Roll churn month by month from signup onward.
        for (let k = m + 1; k < MONTHS; k++) {
          if (Math.random() < p.monthlyChurn) { canceledAt = randomDayIn(k); break; }
        }
        if (canceledAt && canceledAt <= signedUpAt) canceledAt = null;
      }

      const tier = weightedTier(p.tiers);
      const id = `${p.label.slice(0, 3).toLowerCase()}_${n++}`;
      out.push({
        customer: {
          externalId: `cus_${id}`,
          email: `${pick(FIRST).toLowerCase()}.${pick(LAST).toLowerCase()}${Math.floor(Math.random() * 900 + 100)}@example.com`,
          name: `${pick(FIRST)} ${pick(LAST)}`,
          country: pick(COUNTRIES),
          signedUpAt,
          utm: pick(SOURCES),
        },
        externalId: `sub_${id}`,
        planName: tier.name,
        mrrCents: tier.cents,
        startedAt: signedUpAt,
        trialStartAt,
        trialEndAt,
        canceledAt,
        failedTrial,
      });
    }
  }
  return out;
}

/** Billing begins when the trial lapses, so MRR lags signup for trial users. */
const paidFrom = (s: SimSub): Date => s.trialEndAt ?? s.startedAt;

async function chunked<T>(rows: T[], fn: (batch: T[]) => Promise<unknown>, size = 500) {
  for (let i = 0; i < rows.length; i += size) await fn(rows.slice(i, i + size));
}

const dayStr = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
  console.log(`Seeding ${MONTHS} months of customer-level demo data for ${EMAIL}...`);

  const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, EMAIL) });
  const userId = existing?.id ?? crypto.randomUUID();
  if (!existing) await db.insert(users).values({ id: userId, email: EMAIL });

  const sessionToken = crypto.randomUUID();
  await db.insert(sessions).values({
    token: sessionToken, userId, expiresAt: new Date(Date.now() + 30 * 864e5),
  }).onConflictDoNothing();

  for (const p of PRODUCTS) {
    const prev = await db.query.connections.findFirst({
      where: (c, { eq, and }) => and(eq(c.userId, userId), eq(c.label, p.label)),
    });
    // Cascades clear customers, subscriptions, snapshots and events.
    if (prev) await db.delete(connections).where(eq(connections.id, prev.id));

    const connId = crypto.randomUUID();
    await db.insert(connections).values({
      id: connId, userId, provider: p.provider, label: p.label,
      apiKey: p.apiKey, color: p.color, currency: "usd", lastSyncedAt: new Date(),
    });

    const sim = simulate(p);

    // Customers
    const custRows = sim.map((s) => ({
      id: crypto.randomUUID(),
      connectionId: connId,
      externalId: s.customer.externalId,
      email: s.customer.email,
      name: s.customer.name,
      country: s.customer.country,
      signedUpAt: s.customer.signedUpAt,
      utmSource: s.customer.utm?.source ?? null,
      utmMedium: s.customer.utm?.medium ?? null,
      utmCampaign: s.customer.utm?.campaign ?? null,
      referrer: null,
    }));
    await chunked(custRows, (b) => db.insert(customers).values(b));

    // Subscriptions
    const subRows = sim.map((s, i) => ({
      connectionId: connId,
      customerId: custRows[i].id,
      externalId: s.externalId,
      planName: s.planName,
      status: s.canceledAt ? "canceled" : paidFrom(s) > new Date() ? "trialing" : "active",
      mrrCents: s.canceledAt || paidFrom(s) > new Date() ? 0 : s.mrrCents,
      currency: "usd",
      interval: "month",
      quantity: 1,
      startedAt: s.startedAt,
      trialStartAt: s.trialStartAt,
      trialEndAt: s.trialEndAt,
      canceledAt: s.canceledAt,
    }));
    await chunked(subRows, (b) => db.insert(subscriptions).values(b));

    // Revenue events, straight off the lifecycle. A trial that lapsed never
    // billed, so it produces neither a new-revenue nor a churn event.
    const paying = sim.filter((s) => !s.failedTrial);
    const events = [
      ...paying.map((s) => ({
        connectionId: connId, externalId: s.externalId, eventType: "new",
        amountCents: s.mrrCents, currency: "usd", occurredAt: paidFrom(s),
      })),
      ...paying.filter((s) => s.canceledAt).map((s) => ({
        connectionId: connId, externalId: s.externalId, eventType: "churn",
        amountCents: s.mrrCents, currency: "usd", occurredAt: s.canceledAt!,
      })),
    ].filter((e) => e.occurredAt <= new Date());
    await chunked(events, (b) => db.insert(revenueEvents).values(b));

    // Daily snapshots derived from the same lifecycle
    const firstDay = monthStart(0);
    const totalDays = Math.floor((Date.now() - firstDay.getTime()) / 864e5);
    const snapRows: typeof snapshots.$inferInsert[] = [];
    for (let d = 0; d <= totalDays; d++) {
      const day = new Date(firstDay.getTime() + d * 864e5);
      const nextDay = new Date(day.getTime() + 864e5);
      let mrr = 0, active = 0, newMrr = 0, churnedMrr = 0;
      for (const s of sim) {
        if (s.failedTrial) continue;
        const from = paidFrom(s);
        const live = from <= day && (!s.canceledAt || s.canceledAt > day);
        if (live) { mrr += s.mrrCents; active++; }
        if (from >= day && from < nextDay) newMrr += s.mrrCents;
        if (s.canceledAt && s.canceledAt >= day && s.canceledAt < nextDay) churnedMrr += s.mrrCents;
      }
      snapRows.push({
        connectionId: connId, date: dayStr(day), mrrCents: mrr,
        newMrrCents: newMrr, churnedMrrCents: churnedMrr,
        expansionMrrCents: 0, contractionMrrCents: 0, activeSubscriptions: active,
      });
    }
    await chunked(snapRows, (b) => db.insert(snapshots).values(b).onConflictDoNothing());

    const last = snapRows[snapRows.length - 1];
    console.log(
      `  ${p.label}: ${sim.length} customers, ${last.activeSubscriptions} active, ` +
      `MRR $${((last.mrrCents ?? 0) / 100).toLocaleString()}, ${snapRows.length} days`
    );
  }

  console.log(`\nDone. Session cookie: session=${sessionToken}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
