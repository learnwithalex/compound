import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { fetchStripeOverview } from "@/lib/stripe";
import { fetchLemonSqueezyOverview } from "@/lib/lemonsqueezy";
import { fetchPolarOverview } from "@/lib/polar";
import { fetchDodoOverview } from "@/lib/dodopayments";
import { fetchPaystackOverview } from "@/lib/paystack";

export const PROVIDERS = ["stripe", "lemonsqueezy", "polar", "dodopayments", "paystack"] as const;

const COLORS = ["#5e6ad2", "#26c16b", "#f2b030", "#e3493c", "#06b6d4", "#a855f7", "#f97316"];

export async function GET() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.query.connections.findMany({
    where: (c, { eq }) => eq(c.userId, userId),
    columns: { apiKey: false },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { provider, label, apiKey } = await req.json();
  if (!provider || !label || !apiKey) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  if (!(PROVIDERS as readonly string[]).includes(provider)) return NextResponse.json({ error: "invalid provider" }, { status: 400 });

  // Test the key works before saving
  try {
    if (provider === "stripe") await fetchStripeOverview(apiKey);
    if (provider === "lemonsqueezy") await fetchLemonSqueezyOverview(apiKey);
    if (provider === "polar") await fetchPolarOverview(apiKey);
    if (provider === "dodopayments") await fetchDodoOverview(apiKey);
    if (provider === "paystack") await fetchPaystackOverview(apiKey);
  } catch {
    return NextResponse.json({ error: "API key is invalid or has insufficient permissions" }, { status: 400 });
  }

  const existing = await db.query.connections.findMany({ where: (c, { eq }) => eq(c.userId, userId) });
  const color = COLORS[existing.length % COLORS.length];

  const [conn] = await db.insert(connections).values({ userId, provider, label, apiKey, color }).returning();
  return NextResponse.json({ id: conn.id, label: conn.label, provider: conn.provider, color: conn.color });
}

export async function DELETE(req: Request) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(connections).where(and(eq(connections.id, id), eq(connections.userId, userId)));
  return NextResponse.json({ ok: true });
}
