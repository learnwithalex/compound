import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { snapshots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { backfillHistory } from "@/lib/sync-core";

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const conns = await db.query.connections.findMany({
    where: (c, { eq }) => eq(c.userId, userId),
  });

  const results: Record<string, string> = {};
  for (const conn of conns) {
    try {
      // Clear existing snapshots so backfillHistory's guard doesn't block it
      await db.delete(snapshots).where(eq(snapshots.connectionId, conn.id));
      await backfillHistory(conn.id);
      results[conn.id] = "ok";
    } catch (e) {
      results[conn.id] = String(e);
    }
  }

  return NextResponse.json({ results });
}
