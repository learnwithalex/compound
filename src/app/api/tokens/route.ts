import { NextResponse } from "next/server";
import { userIdFromSession, newApiToken, hashApiToken } from "@/lib/auth";
import { db } from "@/db";
import { apiTokens } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

// List active tokens (prefix + metadata only, never the secret).
export async function GET() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.query.apiTokens.findMany({
    where: (t, { eq, and, isNull }) => and(eq(t.userId, userId), isNull(t.revokedAt)),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    columns: { tokenHash: false },
  });
  return NextResponse.json(rows);
}

// Create a token. The plaintext is returned once and never stored.
export async function POST(req: Request) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { name } = await req.json().catch(() => ({}));
  const { token, prefix } = newApiToken();
  const [row] = await db.insert(apiTokens).values({
    userId,
    name: String(name ?? "agent").slice(0, 60) || "agent",
    tokenHash: hashApiToken(token),
    tokenPrefix: prefix,
  }).returning({ id: apiTokens.id, name: apiTokens.name, tokenPrefix: apiTokens.tokenPrefix, createdAt: apiTokens.createdAt });
  return NextResponse.json({ ...row, token });
}

// Revoke a token.
export async function DELETE(req: Request) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await db.update(apiTokens).set({ revokedAt: new Date() })
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, userId)));
  return NextResponse.json({ ok: true });
}
