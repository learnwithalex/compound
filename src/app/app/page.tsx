import { redirect } from "next/navigation";
import { db } from "@/db";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, type ProductMetrics } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { AnalyzeButton } from "./analyze-button";
import { MiniChart } from "./mini-chart";
import { TrendChart } from "./trend-chart";
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
              <TrendChart series={portfolioSeries} height={320} />
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
    <a href={`/app/products/${p.connectionId}`} className="block rounded-2xl bg-white px-5 pb-4 pt-4 transition-shadow hover:shadow-md" style={{ border: "1px solid #ddd9d0" }}>
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
    </a>
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
