import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";

export async function POST(req: Request) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { category, message } = await req.json();
  if (!category || !message?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });

  const apiKey = process.env.EMAIL_API_KEY?.trim();
  const base = process.env.EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  const from = process.env.EMAIL_FROM ?? "Compound <noreply@send.orizon.ng>";
  const to = "support@usecompound.xyz";

  if (apiKey) {
    await fetch(`${base}/v1/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to,
        subject: `[Feedback] ${category} — ${user?.email ?? userId}`,
        html: `<p><strong>From:</strong> ${user?.email ?? userId}</p>
<p><strong>Type:</strong> ${category}</p>
<hr/>
<p>${message.replace(/\n/g, "<br/>")}</p>`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
