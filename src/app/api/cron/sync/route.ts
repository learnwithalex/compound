import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { syncConnection } from "@/lib/stripe";
import { syncLemonSqueezyConnection } from "@/lib/lemonsqueezy";
import { syncPolarConnection } from "@/lib/polar";
import { syncDodoConnection } from "@/lib/dodopayments";
import { syncPaystackConnection } from "@/lib/paystack";

function syncAny(connectionId: string, provider: string) {
  if (provider === "lemonsqueezy") return syncLemonSqueezyConnection(connectionId);
  if (provider === "polar") return syncPolarConnection(connectionId);
  if (provider === "dodopayments") return syncDodoConnection(connectionId);
  if (provider === "paystack") return syncPaystackConnection(connectionId);
  return syncConnection(connectionId);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const conns = await db.query.connections.findMany();
  const results = await Promise.allSettled(conns.map((c) => syncAny(c.id, c.provider)));

  const synced = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));

  return NextResponse.json({ synced, failed, total: conns.length });
}
