import { NextRequest, NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { snapshots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { backfillHistory } from "@/lib/sync-core";

export async function POST(req: NextRequest) {
  // Accept either a logged-in session or the cron secret
  const secret = process.env.CRON_SECRET;
  const viaSecret = secret && req.headers.get("x-cron-secret") === secret;
  if (!viaSecret) {
    const userId = await userIdFromSession();
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const conns = await db.query.connections.findMany();

  const results: Record<string, string> = {};
  for (const conn of conns) {
    try {
      await db.delete(snapshots).where(eq(snapshots.connectionId, conn.id));
      await backfillHistory(conn.id);
      results[conn.id] = "ok";
    } catch (e) {
      results[conn.id] = String(e);
    }
  }

  return NextResponse.json({ results });
}
