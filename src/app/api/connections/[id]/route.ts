import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("websiteUrl" in body) allowed.websiteUrl = body.websiteUrl ?? null;
  if ("iconUrl" in body) allowed.iconUrl = body.iconUrl ?? null;
  if ("label" in body && typeof body.label === "string" && body.label.trim()) {
    allowed.label = body.label.trim();
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(connections)
    .set(allowed)
    .where(and(eq(connections.id, id), eq(connections.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, websiteUrl: updated.websiteUrl, iconUrl: updated.iconUrl, label: updated.label });
}
