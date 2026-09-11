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
              <StepChart series={portfolioSeries} height={230} />
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

/* ============================================================ step chart (server-rendered SVG) */

function StepChart({ series, height = 230 }: {
  series: { date: string; value: number }[];
  height?: number;
}) {
  const data = series.map((s) => s.value);
  const w = 640;
  const h = 240;
  const padLeft = 52;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 30;
  const max = Math.max(...data);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const innerW = w - padLeft - padRight;
  const innerH = h - padTop - padBottom;
  const x = (i: number) => padLeft + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padTop + (1 - (v - min) / range) * innerH;

  // Step path: horizontal, then vertical jump at each change
  let d = `M ${x(0).toFixed(1)},${y(data[0]).toFixed(1)}`;
  for (let i = 1; i < data.length; i++) {
    d += ` H ${x(i).toFixed(1)}`;
    if (data[i] !== data[i - 1]) d += ` V ${y(data[i]).toFixed(1)}`;
  }
  const area = `${d} V ${padTop + innerH} H ${x(0).toFixed(1)} Z`;

  // Movement points: where the value actually changed
  const moves: { i: number; date: string; from: number; to: number }[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i] !== data[i - 1]) moves.push({ i, date: series[i].date, from: data[i - 1], to: data[i] });
  }

  // Y-axis ticks
  const ticks = [0, 1, 2, 3, 4].map((f) => min + (range * f) / 4);

  const stepColor = "#16a34a";
  const flatColor = "#5e6ad2";

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height, display: "block" }} aria-hidden>
        <defs>
          <linearGradient id="ag-step" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padLeft} x2={w - padRight} y1={y(t)} y2={y(t)} stroke="#ece9e3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={padLeft - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#9c9894" fontWeight="500">
              {fmtMrr(Math.round(t))}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#ag-step)" />
        <path d={d} fill="none" stroke={moves.length > 0 ? stepColor : flatColor} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {moves.map((m, k) => (
          <g key={k}>
            <line
              x1={x(m.i)} x2={x(m.i)} y1={y(m.to)} y2={padTop + innerH}
              stroke="#c8c4bc" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke"
            />
            <circle cx={x(m.i)} cy={y(m.to)} r="4.5" fill={m.to >= m.from ? stepColor : "#e3493c"} stroke="#ffffff" strokeWidth="2" />
          </g>
        ))}
        <circle cx={x(0)} cy={y(data[0])} r="4.5" fill={flatColor} stroke="#ffffff" strokeWidth="2" />
      </svg>
      {moves.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {moves.slice(-3).map((m, k) => {
            const up = m.to >= m.from;
            return (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-lx-muted"
                style={{ background: "#f7f5f1", border: "1px dashed #c8c4bc" }}
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: up ? stepColor : "#5e6ad2" }}
                >
                  {up ? "▲" : "●"}
                </span>
                {up ? "+" : ""}{fmtMrr(m.to - m.from)} · {new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            );
          })}
        </div>
      )}
    </div>
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
