import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { syncConnection } from "@/lib/stripe";
import { syncLemonSqueezyConnection } from "@/lib/lemonsqueezy";

function syncAny(connectionId: string, provider: string) {
  if (provider === "lemonsqueezy") return syncLemonSqueezyConnection(connectionId);
  return syncConnection(connectionId);
}

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const conns = await db.query.connections.findMany({ where: (c, { eq }) => eq(c.userId, userId) });
  const results = await Promise.allSettled(conns.map((c) => syncAny(c.id, c.provider)));

  const synced = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));

  return NextResponse.json({ synced, failed });
}
