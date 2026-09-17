import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { createCheckoutSession } from "@/lib/billing";

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  const session = await createCheckoutSession(user.email, userId);
  return NextResponse.json({ url: session.checkout_url });
}
