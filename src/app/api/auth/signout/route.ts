import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { appUrl } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  const token = jar.get("session")?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    jar.delete("session");
  }
  return NextResponse.redirect(`${appUrl()}/login`);
}
