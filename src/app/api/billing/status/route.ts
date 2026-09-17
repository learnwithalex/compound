import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";

export async function GET() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const settings = await db.query.userSettings.findFirst({
    where: (s, { eq }) => eq(s.userId, userId),
  });

  return NextResponse.json({ isPro: settings?.isPro ?? false });
}
