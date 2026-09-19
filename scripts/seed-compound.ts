import { db } from "../src/db/index";
import { users, connections, snapshots, trackerTokens } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  // Get first real user (not demo)
  const all = await db.select({ id: users.id, email: users.email }).from(users);
  console.log("Users:", JSON.stringify(all, null, 2));

  const user = all.find(u => u.email !== "demo@compound.so") ?? all[0];
  if (!user) { console.error("No user found"); process.exit(1); }
  console.log("Seeding for:", user.email, user.id);

  // Check if Compound connection already exists
  const existing = await db.query.connections.findFirst({
    where: (c, { and, eq }) => and(eq(c.userId, user.id), eq(c.label, "Compound")),
  });

  let connId: string;

  if (existing) {
    connId = existing.id;
    console.log("Connection already exists:", connId);
  } else {
    // Create a connection for Compound itself (dummy provider — we'll seed manually)
    const [conn] = await db.insert(connections).values({
      userId: user.id,
      provider: "stripe",
      label: "Compound",
      apiKey: "dummy_will_not_sync",
      color: "#5e6ad2",
      websiteUrl: "https://usecompound.xyz",
    }).returning();
    connId = conn.id;
    console.log("Created connection:", connId);
  }

  // Create tracker token
  const existingToken = await db.query.trackerTokens.findFirst({
    where: (t, { eq }) => eq(t.connectionId, connId),
  });
  if (!existingToken) {
    await db.insert(trackerTokens).values({ connectionId: connId });
  }
  const token = await db.query.trackerTokens.findFirst({
    where: (t, { eq }) => eq(t.connectionId, connId),
  });
  console.log("Tracker token:", token?.token);

  // Seed 90 days of growing MRR snapshots
  const today = new Date();
  const rows = [];
  let mrrCents = 120_000; // start at $1,200 MRR

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Healthy SaaS growth ~3-5% weekly, with daily noise
    const dailyGrowth = 1 + (Math.random() * 0.025 - 0.005);
    mrrCents = Math.round(mrrCents * dailyGrowth);
    const subs = Math.max(1, Math.round(mrrCents / 900));
    const newMrr = Math.round(mrrCents * 0.045);
    const churnMrr = Math.round(mrrCents * 0.012);

    rows.push({
      connectionId: connId,
      date: dateStr,
      mrrCents,
      newMrrCents: newMrr,
      churnedMrrCents: churnMrr,
      expansionMrrCents: 0,
      contractionMrrCents: 0,
      activeSubscriptions: subs,
    });
  }

  // Upsert snapshots (delete existing first)
  await db.delete(snapshots).where(eq(snapshots.connectionId, connId));
  await db.insert(snapshots).values(rows);
  console.log(`Inserted ${rows.length} snapshots`);
  console.log(`Final MRR: $${(mrrCents / 100).toFixed(2)}, subs: ${rows[rows.length - 1].activeSubscriptions}`);
  console.log("\nTracking snippet:");
  console.log(`<script async src="https://usecompound.xyz/t.js?k=${token?.token}"></script>`);

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
