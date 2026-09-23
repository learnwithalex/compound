import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { connections, subscriptions, customers, userSettings, revenueEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { appUrl } from "@/lib/auth";

const ALERT_FROM = process.env.EMAIL_FROM ?? "Compound <noreply@send.orizon.ng>";

async function sendAlertEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  if (!apiKey) return;
  const base = process.env.EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  await fetch(`${base}/v1/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: ALERT_FROM, to, subject, html }),
  });
}

function alertEmail(type: "new" | "churn" | "upgrade" | "past_due", opts: {
  productLabel: string;
  customerEmail?: string | null;
  planName?: string | null;
  mrrCents: number;
  prevMrrCents?: number;
}): { subject: string; html: string } {
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
  const url = appUrl();

  const titles: Record<string, string> = {
    new: `New subscription · ${opts.productLabel}`,
    churn: `Subscription canceled · ${opts.productLabel}`,
    upgrade: `Subscription upgraded · ${opts.productLabel}`,
    past_due: `Payment past due · ${opts.productLabel}`,
  };
  const colors: Record<string, string> = {
    new: "#0f9b6c",
    churn: "#c8392c",
    upgrade: "#5e6ad2",
    past_due: "#f59e0b",
  };
  const glyphs: Record<string, string> = { new: "+", churn: "×", upgrade: "↑", past_due: "!" };

  const color = colors[type];
  const glyph = glyphs[type];
  const title = titles[type];
  const mrrLine = type === "upgrade" && opts.prevMrrCents != null
    ? `${fmt(opts.prevMrrCents)} → ${fmt(opts.mrrCents)}/mo`
    : `${fmt(opts.mrrCents)}/mo`;

  const bodyLine = type === "new"
    ? `${opts.customerEmail ?? "A customer"} subscribed to ${opts.planName ?? opts.productLabel}.`
    : type === "churn"
    ? `${opts.customerEmail ?? "A customer"} canceled their ${opts.planName ?? ""} subscription.`
    : type === "upgrade"
    ? `${opts.customerEmail ?? "A customer"} upgraded from ${fmt(opts.prevMrrCents ?? 0)} to ${fmt(opts.mrrCents)}/mo.`
    : `${opts.customerEmail ?? "A customer"}'s payment is past due — ${fmt(opts.mrrCents)}/mo at risk.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:15px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">compound</span><span style="color:#ff5c00;font-size:15px;font-weight:700;">.</span>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e8e5e0;border-radius:8px;padding:36px 40px;">
          <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:20px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;background:${color};color:#fff;font-size:18px;font-weight:700;">${glyph}</span>
            <h1 style="margin:0;font-size:18px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">${title}</h1>
          </div>
          <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">${bodyLine}</p>
          <div style="background:#fafafa;border:1px solid #e8e5e0;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.02em;">${mrrLine}</p>
            ${opts.planName ? `<p style="margin:4px 0 0;font-size:12px;color:#999;">${opts.planName}</p>` : ""}
          </div>
          <a href="${url}/app" style="display:inline-block;background:#03301D;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:600;">View dashboard →</a>
        </td></tr>
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#b0aba3;">© ${new Date().getFullYear()} Compound · <a href="https://usecompound.xyz" style="color:#b0aba3;">usecompound.xyz</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: title, html };
}

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
