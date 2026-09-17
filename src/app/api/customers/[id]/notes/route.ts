import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { customerNotes, customers, connections } from "@/db/schema";
import { userIdFromSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

// Verify the customer belongs to the current user's connection
async function verifyOwnership(userId: string, customerId: string): Promise<boolean> {
  const cust = await db.query.customers.findFirst({ where: (c, { eq }) => eq(c.id, customerId) });
  if (!cust) return false;
  const conn = await db.query.connections.findFirst({
    where: (c, { eq, and }) => and(eq(c.id, cust.connectionId), eq(c.userId, userId)),
  });
  return !!conn;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!await verifyOwnership(userId, id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const notes = await db.query.customerNotes.findMany({
    where: (n, { eq }) => eq(n.customerId, id),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!await verifyOwnership(userId, id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { note } = await req.json();
  if (!note?.trim()) return NextResponse.json({ error: "note required" }, { status: 400 });

  const [created] = await db.insert(customerNotes).values({ customerId: id, userId, note: note.trim() }).returning();
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params;
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { noteId } = await req.json();
  await db.delete(customerNotes).where(and(eq(customerNotes.id, noteId), eq(customerNotes.userId, userId)));
  return NextResponse.json({ ok: true });
}
