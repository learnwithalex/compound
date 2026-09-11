import { NextResponse } from "next/server";
import { requestLink } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    const { devUrl } = await requestLink(String(email));
    return NextResponse.json({ ok: true, devUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
