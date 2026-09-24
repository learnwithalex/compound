import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { connections, subscriptions, customers, userSettings, revenueEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendAlertEmail, alertEmail } from "@/lib/alerts";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.webhookToken, token),
  });
  if (!conn) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad body" }, { status: 400 }); }

  const type = body.type as string;
  const data = (body.data as Record<string, unknown>)?.object as Record<string, unknown> | undefined;
  if (!data) return NextResponse.json({ ok: true });

  // Load user's alert settings
  const settings = await db.query.userSettings.findFirst({ where: (s, { eq }) => eq(s.userId, conn.userId) });
  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, conn.userId) });
  const userEmail = user?.email;

  // ─── customer.subscription.created / updated / deleted ───────────────────
  if (type === "customer.subscription.created" || type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    const sub = data;
    const externalId = String(sub.id ?? "");
    const stripeCustomerId = String(sub.customer ?? "");
    const status = String(sub.status ?? "active");
    const canceledAt = sub.canceled_at ? new Date(Number(sub.canceled_at) * 1000) : null;

    // Determine MRR from items
    const items = (sub.items as Record<string, unknown>)?.data as Array<Record<string, unknown>> | undefined;
    let mrrCents = 0;
    let planName: string | null = null;
    let interval: string | null = null;
    let quantity = 1;
    if (items?.length) {
      const item = items[0];
      const price = item.price as Record<string, unknown>;
      quantity = Number(item.quantity ?? 1);
      const unitAmount = Number(price?.unit_amount ?? 0);
      interval = String((price?.recurring as Record<string, unknown>)?.interval ?? "month");
      planName = String((price?.product as Record<string, unknown>)?.name ?? price?.nickname ?? "");
      const intervalCount = Number((price?.recurring as Record<string, unknown>)?.interval_count ?? 1);
      // Normalise to monthly
      mrrCents = interval === "year"
        ? Math.round((unitAmount * quantity) / 12 / intervalCount)
        : interval === "week"
        ? Math.round((unitAmount * quantity * 52) / 12 / intervalCount)
        : Math.round((unitAmount * quantity) / intervalCount);
    }
    if (status === "canceled" || status === "incomplete_expired") mrrCents = 0;

    // Upsert customer
    let customerId: string | null = null;
    if (stripeCustomerId) {
      let cust = await db.query.customers.findFirst({
        where: (c, { eq, and }) => and(eq(c.connectionId, conn.id), eq(c.externalId, stripeCustomerId)),
      });
      if (!cust) {
        const [created] = await db.insert(customers).values({
          connectionId: conn.id,
          externalId: stripeCustomerId,
          email: (sub.customer_email as string) ?? null,
        }).returning();
        cust = created;
      }
      customerId = cust.id;
    }

    // Get previous MRR for upgrade detection
    const existingSub = await db.query.subscriptions.findFirst({
      where: (s, { eq, and }) => and(eq(s.connectionId, conn.id), eq(s.externalId, externalId)),
    });
    const prevMrr = existingSub?.mrrCents ?? 0;

    // Upsert subscription
    const startedAt = sub.start_date ? new Date(Number(sub.start_date) * 1000) : null;
    const trialStartAt = sub.trial_start ? new Date(Number(sub.trial_start) * 1000) : null;
    const trialEndAt = sub.trial_end ? new Date(Number(sub.trial_end) * 1000) : null;

    if (existingSub) {
      await db.update(subscriptions)
        .set({ status, mrrCents, planName, interval, quantity, canceledAt, trialStartAt, trialEndAt, lastSeenAt: new Date() })
        .where(and(eq(subscriptions.connectionId, conn.id), eq(subscriptions.externalId, externalId)));
    } else {
      await db.insert(subscriptions).values({
        connectionId: conn.id,
        customerId,
        externalId,
        status,
        mrrCents,
        planName,
        interval: interval ?? "month",
        quantity,
        startedAt,
        trialStartAt,
        trialEndAt,
        canceledAt,
        currency: conn.currency,
      });
    }

    // Determine event type for revenue events
    let eventType: string | null = null;
    if (type === "customer.subscription.created") eventType = "new";
    else if (type === "customer.subscription.deleted") eventType = "churn";
    else if (mrrCents > prevMrr && prevMrr > 0) eventType = "expansion";
    else if (mrrCents < prevMrr && mrrCents > 0) eventType = "contraction";

    if (eventType) {
      await db.insert(revenueEvents).values({
        connectionId: conn.id,
        externalId,
        eventType,
        amountCents: Math.abs(mrrCents - prevMrr) || mrrCents,
        currency: conn.currency,
        occurredAt: new Date(),
        metadata: JSON.stringify({ planName, customerEmail: (sub.customer_email as string) ?? null }),
      });
    }

    // Send real-time alerts
    if (userEmail && settings) {
      const custEmail = (sub.customer_email as string) ?? null;
      if (eventType === "new" && settings.alertNewSub) {
        const { subject, html } = alertEmail("new", { productLabel: conn.label, customerEmail: custEmail, planName, mrrCents });
        await sendAlertEmail(userEmail, subject, html);
      }
      if (eventType === "churn" && settings.alertChurn) {
        const { subject, html } = alertEmail("churn", { productLabel: conn.label, customerEmail: custEmail, planName, mrrCents: prevMrr });
        await sendAlertEmail(userEmail, subject, html);
      }
      if (eventType === "expansion" && settings.alertUpgrade) {
        const { subject, html } = alertEmail("upgrade", { productLabel: conn.label, customerEmail: custEmail, planName, mrrCents, prevMrrCents: prevMrr });
        await sendAlertEmail(userEmail, subject, html);
      }
      if (status === "past_due" && settings.alertPastDue) {
        const { subject, html } = alertEmail("past_due", { productLabel: conn.label, customerEmail: custEmail, planName, mrrCents });
        await sendAlertEmail(userEmail, subject, html);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
