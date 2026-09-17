import { NextResponse } from "next/server";
import { db } from "@/db";
import { trackerTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { userIdFromSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const conn = await db.query.connections.findFirst({
    where: (c) => and(eq(c.id, id), eq(c.userId, userId)),
  });
  if (!conn) return NextResponse.json({ error: "not found" }, { status: 404 });

  let tracker = await db.query.trackerTokens.findFirst({
    where: (t) => eq(t.connectionId, id),
  });
  if (!tracker) {
    const [created] = await db.insert(trackerTokens).values({ connectionId: id }).returning();
    tracker = created;
  }

  return NextResponse.json({ token: tracker.token });
}
