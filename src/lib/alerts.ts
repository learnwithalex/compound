import { appUrl } from "@/lib/auth";

const ALERT_FROM = process.env.EMAIL_FROM ?? "Compound <noreply@send.orizon.ng>";

export async function sendAlertEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  if (!apiKey) return;
  const base = process.env.EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  await fetch(`${base}/v1/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: ALERT_FROM, to, subject, html }),
  });
}

export type AlertType = "new" | "churn" | "upgrade" | "past_due";

export function alertEmail(type: AlertType, opts: {
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
