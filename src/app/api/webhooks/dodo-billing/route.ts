import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const secret = process.env.DODO_BILLING_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "misconfigured" }, { status: 500 });

  const rawBody = await req.text();
  const wh = new Webhook(secret);

  let event: Record<string, unknown>;
  try {
    event = wh.verify(rawBody, {
      "webhook-id": req.headers.get("webhook-id") ?? "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": req.headers.get("webhook-signature") ?? "",
    }) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const type = event.type as string;
  const data = event.data as Record<string, unknown>;
  const meta = (data?.metadata ?? {}) as Record<string, string>;
  const userId = meta.compound_user_id;
  const subscriptionId = (data?.subscription_id ?? data?.id) as string | undefined;

  if (!userId) return NextResponse.json({ ok: true }); // not our event

  if (type === "subscription.active") {
    await db.insert(userSettings)
      .values({ userId, isPro: true, dodoSubscriptionId: subscriptionId })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: { isPro: true, dodoSubscriptionId: subscriptionId },
      });
  }

  if (type === "subscription.cancelled" || type === "subscription.expired") {
    await db.update(userSettings)
      .set({ isPro: false, dodoSubscriptionId: null })
      .where(eq(userSettings.userId, userId));
  }

  return NextResponse.json({ ok: true });
}
