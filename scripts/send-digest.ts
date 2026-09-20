import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const EMAIL_KEY = "orz_dQ7ViIo2yjLZ9jA0fpQk5vWBF93kkkwQ";
const BASE = "https://usecompound.xyz";

function fmt(cents: number) {
  const n = cents / 100;
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "k";
  return "$" + n.toFixed(0);
}

function pct(a: number, b: number) {
  if (!b) return { str: "+0.0%", up: true };
  const p = ((a - b) / b) * 100;
  return { str: (p >= 0 ? "+" : "") + p.toFixed(1) + "%", up: p >= 0 };
}

function providerIcon(provider: string): string {
  const k = provider.toLowerCase().replace(/[^a-z]/g, "");
  return ({
    stripe: "https://cdn.simpleicons.org/stripe/635bff",
    lemonsqueezy: "https://cdn.simpleicons.org/lemonsqueezy/e5a00d",
    polar: `${BASE}/polar-icon.svg`,
    dodopayments: `${BASE}/dodopayments-icon.svg`,
    paddle: "https://cdn.simpleicons.org/paddle/0066ff",
    paystack: `${BASE}/paystack-icon.png`,
  } as Record<string, string>)[k] ?? "https://cdn.simpleicons.org/stripe/635bff";
}

function productFavicon(websiteUrl: string | null, provider: string): string {
  if (websiteUrl) {
    try {
      const domain = new URL(websiteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {}
  }
  return providerIcon(provider);
}

async function main() {
  const userId = (await sql`SELECT id FROM users WHERE email = 'alexprogramming55@gmail.com'`)[0]?.id;

  const connections = await sql`
    SELECT c.id, c.label, c.provider, c.color, c.website_url,
           COALESCE(s.mrr_cents, 0) AS mrr_cents,
           COALESCE(s.active_subscriptions, 0) AS active_subscriptions
    FROM connections c
    LEFT JOIN LATERAL (
      SELECT mrr_cents, active_subscriptions FROM snapshots
      WHERE connection_id = c.id ORDER BY date DESC LIMIT 1
    ) s ON true
    WHERE c.user_id = ${userId}
    ORDER BY s.mrr_cents DESC NULLS LAST
  `;

  const primary = connections.find((c: any) => c.id === '371850e4-bb3f-4b35-b0b6-6f2967a88a05') ?? connections[0];

  const rows = await sql`
    SELECT mrr_cents, new_mrr_cents, churned_mrr_cents, active_subscriptions
    FROM snapshots WHERE connection_id = ${primary.id}
    ORDER BY date DESC LIMIT 30
  `;

  const data = rows.map((r: any) => ({
    mrr: Number(r.mrr_cents), newMrr: Number(r.new_mrr_cents),
    churnMrr: Number(r.churned_mrr_cents), subs: Number(r.active_subscriptions),
  }));

  const today = data[0];
  const weekAgo = data[6] ?? data[data.length - 1];
  const monthAgo = data[data.length - 1];
  const mrr = today.mrr, arr = mrr * 12, subs = today.subs;
  const weekChange = pct(mrr, weekAgo.mrr);
  const monthChange = pct(mrr, monthAgo.mrr);
  const newMrr = data.slice(0, 7).reduce((s, r) => s + r.newMrr, 0);
  const churnMrr = data.slice(0, 7).reduce((s, r) => s + r.churnMrr, 0);
  const netNew = newMrr - churnMrr;

  // Sparkline via QuickChart.io — renders as a real PNG <img>, works in all email clients
  const spark = [...data].reverse().map(r => r.mrr);
  // Chart.js 2.x syntax (QuickChart default)
  const chartCfg = {
    type: "line",
    data: {
      labels: spark.map(() => ""),
      datasets: [{
        label: "",
        data: spark,
        borderColor: "#5e6ad2",
        backgroundColor: "rgba(94,106,210,0.12)",
        borderWidth: 2.5,
        fill: true,
        pointRadius: 0,
        lineTension: 0.4,
      }],
    },
    options: {
      legend: { display: false },
      scales: {
        xAxes: [{ display: false, gridLines: { display: false } }],
        yAxes: [{ display: false, gridLines: { display: false } }],
      },
      layout: { padding: 0 },
    },
  };
  const sparkImgUrl = `https://quickchart.io/chart?w=500&h=80&bkg=white&c=${encodeURIComponent(JSON.stringify(chartCfg))}`;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // Build products rows as proper <tr> elements in one table
  const productRows = (connections as any[]).map((c, i) => {
    const connMrr = Number(c.mrr_cents);
    const favicon = productFavicon(c.website_url, c.provider);
    const provIcon = providerIcon(c.provider);
    const providerLabel = c.provider.charAt(0).toUpperCase() + c.provider.slice(1);
    const isLast = i === connections.length - 1;
    return `
      <tr>
        <td style="padding:14px 0 ${isLast ? '0' : '14px'};border-bottom:${isLast ? 'none' : '1px solid #f0eeeb'}">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="38" valign="middle">
                <img src="${favicon}" width="36" height="36" alt="${c.label}"
                  style="border-radius:8px;display:block;border:1px solid #ebebeb"/>
              </td>
              <td valign="middle" style="padding-left:12px">
                <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111;line-height:1">${c.label}</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle"><img src="${provIcon}" width="12" height="12" alt="${c.provider}" style="display:block;border-radius:2px"/></td>
                    <td valign="middle" style="padding-left:5px;font-size:11px;color:#a0a09a">${providerLabel}</td>
                  </tr>
                </table>
              </td>
              <td align="right" valign="middle">
                <p style="margin:0 0 1px;font-size:15px;font-weight:700;color:#111;letter-spacing:-0.02em">${connMrr ? fmt(connMrr) : '—'}</p>
                <p style="margin:0;font-size:10px;color:#a0a09a;text-align:right;text-transform:uppercase;letter-spacing:0.08em">MRR</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  const connectors = [
    { name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/635bff" },
    { name: "Lemon Squeezy", icon: "https://cdn.simpleicons.org/lemonsqueezy/e5a00d" },
    { name: "Polar", icon: `${BASE}/polar-icon.svg` },
    { name: "Paystack", icon: `${BASE}/paystack-icon.png` },
    { name: "DodoPayments", icon: `${BASE}/dodopayments-icon.svg` },
  ];

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0efed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efed;padding:36px 16px 48px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

  <!-- Header -->
  <tr><td style="padding-bottom:22px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <table cellpadding="0" cellspacing="0"><tr>
          <td valign="middle">
            <img src="${BASE}/logo-mark.png" width="48" height="41" alt="Compound" style="display:block"/>
          </td>
          <td valign="middle" style="padding-left:10px;font-size:17px;font-weight:700;color:#111;letter-spacing:-0.025em">compound<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#ff5c00;margin-left:1px;vertical-align:super"></span></td>
        </tr></table>
      </td>
      <td align="right" valign="middle" style="font-size:12px;color:#a0a09a">${dateStr}</td>
    </tr></table>
  </td></tr>

  <!-- Hero card: outer table so sparkline row has zero side-padding -->
  <tr><td style="background:white;border-radius:16px;border:1px solid #e4e0da;overflow:hidden">
    <table width="100%" cellpadding="0" cellspacing="0">
      <!-- Text content -->
      <tr><td style="padding:28px 28px 16px">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.13em;color:#a0a09a">Weekly digest</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px"><tr>
          <td valign="bottom">
            <span style="font-size:44px;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1">${fmt(mrr)}</span>
            <span style="font-size:22px;font-weight:600;color:#9ca3af;letter-spacing:-0.02em"> MRR</span>
          </td>
          <td align="right" valign="bottom" style="padding-bottom:6px">
            <span style="font-size:13px;font-weight:700;color:${weekChange.up ? '#0f9b6c' : '#c8392c'};background:${weekChange.up ? '#ecfdf5' : '#fff5f5'};padding:5px 12px;border-radius:999px;white-space:nowrap">${weekChange.str} this week</span>
          </td>
        </tr></table>
        <p style="margin:0;font-size:13px;color:#6b7280">
          ${monthChange.str} this month &nbsp;·&nbsp; ${subs.toLocaleString()} active subs &nbsp;·&nbsp; ${fmt(arr)} ARR
        </p>
      </td></tr>
      <!-- Sparkline row: PNG via QuickChart, works in all email clients -->
      <tr><td style="padding:0;line-height:0;font-size:0">
        <img src="${sparkImgUrl}" width="560" height="80" alt="MRR trend" style="display:block;width:100%;height:80px;border-radius:0 0 16px 16px"/>
      </td></tr>
    </table>
  </td></tr>

  <tr><td height="10"></td></tr>

  <!-- Stats row -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="background:white;border-radius:12px;border:1px solid #e4e0da;padding:18px 20px" valign="top">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#a0a09a">New MRR</p>
        <p style="margin:0;font-size:24px;font-weight:800;color:#0f9b6c;letter-spacing:-0.03em">+${fmt(newMrr)}</p>
      </td>
      <td width="8"></td>
      <td style="background:white;border-radius:12px;border:1px solid #e4e0da;padding:18px 20px" valign="top">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#a0a09a">Churn MRR</p>
        <p style="margin:0;font-size:24px;font-weight:800;color:${churnMrr > 0 ? '#c8392c' : '#6b7280'};letter-spacing:-0.03em">-${fmt(churnMrr)}</p>
      </td>
      <td width="8"></td>
      <td style="background:${netNew >= 0 ? '#f0fdf8' : '#fff5f5'};border-radius:12px;border:1px solid ${netNew >= 0 ? '#bbf7d0' : '#fecaca'};padding:18px 20px" valign="top">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${netNew >= 0 ? '#059669' : '#dc2626'}">Net new</p>
        <p style="margin:0;font-size:24px;font-weight:800;color:${netNew >= 0 ? '#0f9b6c' : '#c8392c'};letter-spacing:-0.03em">${netNew >= 0 ? '+' : ''}${fmt(netNew)}</p>
      </td>
    </tr></table>
  </td></tr>

  <tr><td height="10"></td></tr>

  <!-- Connected products -->
  <tr><td style="background:white;border-radius:16px;border:1px solid #e4e0da;padding:20px 24px">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.13em;color:#a0a09a">Connected products</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${productRows}
    </table>
  </td></tr>

  <tr><td height="10"></td></tr>

  <!-- Connected via -->
  <tr><td style="background:white;border-radius:16px;border:1px solid #e4e0da;padding:16px 24px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle" style="font-size:11px;font-weight:600;color:#a0a09a;text-transform:uppercase;letter-spacing:0.1em">Connected via</td>
      <td align="right" valign="middle">
        <table cellpadding="0" cellspacing="0"><tr>
          ${connectors.map(cn => `<td style="padding-left:8px" valign="middle">
            <img src="${cn.icon}" width="20" height="20" alt="${cn.name}" title="${cn.name}" style="display:block;border-radius:4px"/>
          </td>`).join("")}
        </tr></table>
      </td>
    </tr></table>
  </td></tr>

  <tr><td height="24"></td></tr>

  <!-- CTA -->
  <tr><td align="center">
    <a href="${BASE}/app" style="display:inline-block;background:#5e6ad2;color:white;font-size:14px;font-weight:600;padding:13px 36px;border-radius:10px;text-decoration:none;letter-spacing:-0.01em">View full dashboard →</a>
  </td></tr>

  <tr><td height="28"></td></tr>

  <!-- Footer -->
  <tr><td align="center" style="font-size:11px;color:#b8b4ae;line-height:2">
    Compound · Revenue OS for indie hackers<br>
    <a href="${BASE}" style="color:#b8b4ae;text-decoration:none">usecompound.xyz</a>
    &nbsp;·&nbsp;
    <a href="${BASE}/app/settings" style="color:#b8b4ae;text-decoration:none">Manage email preferences</a>
  </td></tr>

  <tr><td height="20"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const subject = `${fmt(mrr)} MRR · ${weekChange.str} this week — Compound digest`;
  const res = await fetch("https://api.orizon.ng/v1/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${EMAIL_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Compound <compound@send.orizon.ng>",
      to: ["alexprogramming55@gmail.com"],
      reply_to: ["hello@usecompound.xyz"],
      subject,
      html,
    }),
  });
  console.log(await res.json());
  console.log(`Sent: "${subject}"`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
