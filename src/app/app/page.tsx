import { redirect } from "next/navigation";
import { db } from "@/db";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, type ProductMetrics } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { AnalyzeButton } from "./analyze-button";
import { MiniChart } from "./mini-chart";
import { ShareCard } from "./share-card";
import { ChurnRadar, Milestones } from "./insights";
import { radarSignals } from "@/lib/insights";

function greeting(email: string): { hello: string; name: string } {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const raw = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  const name = raw
    ? raw.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "there";
  return { hello, name };
}

export default async function AppPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });
  const { hello, name } = greeting(user?.email ?? "");

  const metrics = await portfolioMetrics(userId);
  const hasData = metrics.products.length > 0;
  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);

  // Aggregate portfolio history across products by date
  const byDate = new Map<string, number>();
  for (const p of metrics.products) {
    for (const h of p.history) byDate.set(h.date, (byDate.get(h.date) ?? 0) + h.mrrCents);
  }
  const portfolioSeries = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
  const portfolioValues = portfolioSeries.map((s) => s.value);

  return (
    <div className="py-10">
      {/* Welcome */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 text-center sm:text-left">
        <div className="mx-auto sm:mx-0">
          <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            {hello}, {name}.
          </h1>
          <p className="mt-1 text-[14px] text-lx-muted">
            {hasData
              ? `Here's your portfolio across ${ranked.length} product${ranked.length === 1 ? "" : "s"}.`
              : "Let's get your first product connected."}
          </p>
        </div>
        {hasData && <AnalyzeButton />}
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Shareable MRR card */}
          <ShareCard metrics={metrics} />

          {/* Churn radar */}
          <ChurnRadar signals={radarSignals(ranked)} />

          {/* Portfolio trend */}
          <section className="mb-10 rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
                Monthly recurring revenue
              </p>
              {portfolioValues.length > 1 && <TrendDelta data={portfolioValues} />}
            </div>
            {portfolioSeries.length > 1 ? (
              <TrendChart series={portfolioSeries} height={220} />
            ) : (
              <div className="flex h-[190px] items-center justify-center rounded-lg text-[13px] text-lx-faint" style={{ background: "#f7f5f1" }}>
                Sync daily to build your trend
              </div>
            )}
          </section>

          {/* Products */}
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">
              Products · {ranked.length}
            </p>
            <a href="/app/connect" className="text-[12px] font-medium text-lx-purple hover:opacity-80">
              + Add product
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.map((p, i) => (
              <ProductCard key={p.connectionId} product={p} rank={i + 1} />
            ))}
          </div>

          {/* Milestones */}
          <div className="mt-4 pb-14">
            <Milestones products={ranked} />
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================ product card */

function ProductCard({ product: p, rank }: { product: ProductMetrics; rank: number }) {
  const change = p.mrrChange30d;
  const up = change > 0;
  const down = change < 0;
  const icon = productIcon(p.label, p.provider);

  return (
    <div className="rounded-2xl bg-white px-5 pb-4 pt-4" style={{ border: "1px solid #ddd9d0" }}>
      <div className="mb-1 flex items-center gap-2.5">
        <span className="text-[11px] font-semibold tabular-nums text-lx-faint">#{rank}</span>
        <img
          src={icon}
          alt={p.label}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl object-cover"
          style={{ border: "1px solid #ece9e3" }}
          loading="lazy"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold text-lx-text" style={{ letterSpacing: "-0.01em" }}>{p.label}</span>
          <span className="flex items-center gap-1 text-[10px] text-lx-faint">
            {p.provider} · {p.activeSubscriptions.toLocaleString()} subs
          </span>
        </span>
        <span className="flex items-center gap-2">
          <ChangePill change={change} />
          <span className="text-[18px] font-bold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>{fmtMrr(p.mrrCents)}</span>
        </span>
      </div>

      {p.history.length > 1 && (
        <MiniChart data={p.history.map((h) => h.mrrCents)} color={up ? "#10b981" : down ? "#e3493c" : p.color} />
      )}
    </div>
  );
}

function ChangePill({ change }: { change: number }) {
  const up = change > 0;
  const down = change < 0;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
        up ? "text-lx-green" : down ? "text-lx-red" : "text-lx-faint"
      }`}
      style={{ background: up ? "rgba(16,185,129,0.1)" : down ? "rgba(227,73,60,0.1)" : "rgba(0,0,0,0.05)" }}
    >
      {up ? "▲" : down ? "▼" : "•"} {up ? "+" : ""}{change.toFixed(1)}% last 30d
    </span>
  );
}

function TrendDelta({ data }: { data: number[] }) {
  const first = data[0];
  const latest = data[data.length - 1];
  const pct = first > 0 ? ((latest - first) / first) * 100 : 0;
  const up = pct >= 0;
  return (
    <span className={`text-[12px] font-semibold tabular-nums ${up ? "text-lx-green" : "text-lx-red"}`}>
      {up ? "+" : ""}{pct.toFixed(1)}% this period
    </span>
  );
}

/* ============================================================ trend chart (server-rendered SVG) */

function TrendChart({ series, height = 220 }: {
  series: { date: string; value: number }[];
  height?: number;
}) {
  const data = series.map((s) => s.value);
  const w = 640;
  const h = 220;
  const padLeft = 54;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 26;
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  // Scale to the data range with headroom, not to zero — otherwise a 5% move looks flat.
  const span = hi - lo || hi * 0.1 || 1;
  const min = lo - span * 0.35;
  const max = hi + span * 0.25;
  const range = max - min;
  const innerW = w - padLeft - padRight;
  const innerH = h - padTop - padBottom;
  const px = (i: number) => padLeft + (i / (data.length - 1)) * innerW;
  const py = (v: number) => padTop + (1 - (v - min) / range) * innerH;
  const pts = data.map((v, i) => [px(i), py(v)] as [number, number]);

  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  const area = `${d} L ${pts[pts.length - 1][0].toFixed(1)},${padTop + innerH} L ${pts[0][0].toFixed(1)},${padTop + innerH} Z`;
  const last = pts[pts.length - 1];

  const ticks = [0, 1, 2, 3].map((f) => min + (range * (f + 0.35)) / 4);
  const labelAt = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const fmtDay = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ height, display: "block" }} aria-hidden>
      <defs>
        <linearGradient id="ag-trend" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5e6ad2" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padLeft} x2={w - padRight} y1={py(t)} y2={py(t)} stroke="#ece9e3" strokeWidth="1" />
          <text x={padLeft - 10} y={py(t) + 3.5} textAnchor="end" fontSize="10" fill="#9c9894" fontWeight="500">
            {fmtMrr(Math.round(t))}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#ag-trend)" />
      <path d={d} fill="none" stroke="#5e6ad2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="#5e6ad2" stroke="#ffffff" strokeWidth="2" />
      {labelAt.map((i) => (
        <text key={i} x={px(i)} y={h - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="10" fill="#9c9894" fontWeight="500">
          {fmtDay(series[i].date)}
        </text>
      ))}
    </svg>
  );
}

/* ============================================================ empty state */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white" style={{ border: "1px solid #ddd9d0" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c9894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-6" />
        </svg>
      </div>
      <h2 className="mb-2 text-[16px] font-bold text-lx-text">Connect your first product</h2>
      <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-lx-muted">
        Add a Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack API key to see your MRR in one place.
      </p>
      <a
        href="/app/connect"
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#5e6ad2" }}
      >
        Connect a product →
      </a>
    </div>
  );
}
