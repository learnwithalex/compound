import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { revenueGoals } from "@/db/schema";
import { userIdFromSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const goals = await db.query.revenueGoals.findMany({
    where: (g, { eq }) => eq(g.userId, userId),
    orderBy: (g, { asc }) => [asc(g.targetDate)],
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { label, targetMrrCents, targetDate } = await req.json();
  if (!targetMrrCents || !targetDate) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const [goal] = await db.insert(revenueGoals)
    .values({ userId, label: label || "MRR Goal", targetMrrCents: Number(targetMrrCents), targetDate })
    .returning();
  return NextResponse.json(goal, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.delete(revenueGoals).where(and(eq(revenueGoals.id, id), eq(revenueGoals.userId, userId)));
  return NextResponse.json({ ok: true });
}
