/**
 * Seed demo data: one user + 3 products (Event Organizer-scale, BetterFlow-scale, Obsidian-scale)
 * with 31 days of realistic MRR snapshots.
 *
 * Usage: npx tsx scripts/seed-demo.ts [email]
 * Default email: demo@compound.so
 */
import { db } from "../src/db";
import { users, connections, snapshots, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

const EMAIL = process.argv[2] ?? "demo@compound.so";

function dateStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// Simulate MRR growth with a slight trend + noise
function mrrSeries(baseCents: number, days: number, growthPct: number): number[] {
  const result: number[] = [];
  let mrr = baseCents;
  const dailyGrowth = Math.pow(1 + growthPct / 100, 1 / 30) - 1;
  for (let i = days; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * baseCents * 0.005;
    result.push(Math.max(0, Math.round(mrr + noise)));
    mrr = mrr * (1 + dailyGrowth);
  }
  return result;
}

const PRODUCTS: {
  label: string;
  provider: string;
  color: string;
  baseMrrCents: number;  // ~current MRR
  growthPct: number;     // 30d growth %
  activeSubs: number;
  apiKey: string;        // fake key for demo
}[] = [
  {
    label: "Event Organizer",
    provider: "stripe",
    color: "#5e6ad2",
    baseMrrCents: 12_980_000,  // ~$129.8k
    growthPct: 5.1,
    activeSubs: 2104,
    apiKey: "sk_demo_event_organizer",
  },
  {
    label: "BetterFlow",
    provider: "stripe",
    color: "#e8a838",
    baseMrrCents: 840_000,  // ~$8.4k
    growthPct: 18.3,
    activeSubs: 680,
    apiKey: "sk_demo_betterflow",
  },
  {
    label: "Obsidian Sync Free",
    provider: "lemonsqueezy",
    color: "#e54d2e",
    baseMrrCents: 230_000,  // ~$2.3k
    growthPct: -4.1,
    activeSubs: 63,
    apiKey: "lsq_demo_obsidian_sync",
  },
];

async function main() {
  console.log(`Seeding demo data for ${EMAIL}...`);

  // Upsert user
  const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, EMAIL) });
  const userId = existing?.id ?? crypto.randomUUID();
  if (!existing) {
    await db.insert(users).values({ id: userId, email: EMAIL });
    console.log(`Created user ${userId}`);
  } else {
    console.log(`Reusing user ${userId}`);
  }

  // Create session so you can log straight into /app
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(sessions).values({ token: sessionToken, userId, expiresAt }).onConflictDoNothing();
  console.log(`Session token: ${sessionToken}`);

  // Seed each product
  for (const p of PRODUCTS) {
    // Remove any existing connection with same label for this user
    const existingConn = await db.query.connections.findFirst({
      where: (c, { eq, and }) => and(eq(c.userId, userId), eq(c.label, p.label)),
    });
    if (existingConn) {
      await db.delete(snapshots).where(eq(snapshots.connectionId, existingConn.id));
      await db.delete(connections).where(eq(connections.id, existingConn.id));
    }

    const connId = crypto.randomUUID();
    await db.insert(connections).values({
      id: connId,
      userId,
      provider: p.provider,
      label: p.label,
      apiKey: p.apiKey,
      color: p.color,
      currency: "usd",
      lastSyncedAt: new Date(),
    });

    const series = mrrSeries(p.baseMrrCents, 30, p.growthPct);

    for (let i = 0; i < series.length; i++) {
      const mrr = series[i];
      const prevMrr = i > 0 ? series[i - 1] : mrr;
      const diff = mrr - prevMrr;
      await db.insert(snapshots).values({
        connectionId: connId,
        date: dateStr(30 - i),
        mrrCents: mrr,
        newMrrCents: diff > 0 ? diff : 0,
        churnedMrrCents: diff < 0 ? Math.abs(diff) : 0,
        expansionMrrCents: 0,
        contractionMrrCents: 0,
        activeSubscriptions: Math.round(p.activeSubs * (mrr / p.baseMrrCents)),
      }).onConflictDoNothing();
    }

    console.log(`Seeded ${p.label}: ${series.length} snapshots, MRR $${(series[series.length - 1] / 100).toFixed(0)}`);
  }

  console.log("\nDone! To log in as the demo user, run:");
  console.log(`  curl -X POST http://localhost:3000/api/auth/demo-session \\`);
  console.log(`       -H 'Content-Type: application/json' \\`);
  console.log(`       -d '{"token":"${sessionToken}"}'`);
  console.log("\nOr manually set cookie: compound_session=" + sessionToken);
}

main().catch((e) => { console.error(e); process.exit(1); });
