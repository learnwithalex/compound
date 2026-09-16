import { redirect } from "next/navigation";
import { db } from "@/db";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, type ProductMetrics } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { DashboardShell } from "./dashboard-shell";
import { MiniChart } from "./mini-chart";
import { PortfolioHero } from "./portfolio-hero";
import { MomentumStrip } from "./momentum";
import { ShareCard } from "./share-card";
import { ChurnRadar } from "./insights";
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


  if (!hasData) {
    return (
      <div>
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            {hello}, {name}.
          </h1>
          <p className="mt-1 text-[14px] text-lx-muted">Let&apos;s get your first product connected.</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <DashboardShell
        metrics={metrics}
        series={portfolioSeries}
        hello={hello}
        name={name}
        subtitle={`Here's your portfolio across ${ranked.length} product${ranked.length === 1 ? "" : "s"}.`}
      >
        <div className="stagger min-w-0 pb-14">
          <UpgradeBanner />
          <StreakCard />

          <PortfolioHero metrics={metrics} series={portfolioSeries} />

          <MomentumStrip series={portfolioSeries} totalMrrCents={metrics.totalMrrCents} />

          <ShareCard metrics={metrics} />

          <div className="mb-8">
            <ChurnRadar signals={radarSignals(ranked)} />
          </div>

          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">
              Products · {ranked.length}
            </p>
            <a href="/app/connect" className="text-[12px] font-medium text-lx-purple hover:opacity-80">
              + Add product
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ranked.map((p, i) => (
              <ProductCard key={p.connectionId} product={p} rank={i + 1} />
            ))}
          </div>
        </div>
      </DashboardShell>
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
    <a
      href={`/app/products/${p.connectionId}?name=${encodeURIComponent(p.label)}`}
      className="group block overflow-hidden rounded-sm bg-white pb-4 transition-colors hover:border-[#dcdcdc]"
      style={{ border: "1px solid #ebebeb" }}
    >
      <div className="mb-1 flex items-center gap-2.5 px-5 pt-4">
        <span className="w-3 shrink-0 text-[11px] font-medium tabular-nums text-lx-faint">{rank}</span>
        <img
          src={icon}
          alt={p.label}
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-sm object-cover"
          style={{ border: "1px solid #ebebeb" }}
          loading="lazy"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-lx-text">{p.label}</span>
          <span className="flex items-center gap-1 text-[10.5px] text-lx-faint">
            {p.provider} · {p.activeSubscriptions.toLocaleString()} subs
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[17px] font-semibold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>
            {fmtMrr(p.mrrCents)}
          </span>
          <span
            className="block whitespace-nowrap text-[10.5px] font-medium tabular-nums"
            style={{ color: up ? "#0f9b6c" : down ? "#c8392c" : "#9a9a9a" }}
          >
            {up ? "+" : ""}{change.toFixed(1)}% · 30d
          </span>
        </span>
      </div>

      {p.history.length > 1 && (
        <div className="px-5">
          <MiniChart data={p.history.map((h) => h.mrrCents)} color={up ? "#10b981" : down ? "#e3493c" : "#b4b4b4"} />
        </div>
      )}
    </a>
  );
}

/* ============================================================ upgrade banner */

function UpgradeBanner() {
  return (
    <div className="mb-4 flex items-center gap-4 rounded-sm bg-white px-5 py-4" style={{ border: "1px solid #ebebeb" }}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
        style={{ background: "#f0f0f0" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-lx-text">Try compound Pro free for 14 days</p>
        <p className="mt-0.5 text-[12px]" style={{ color: "#5e6ad2" }}>
          Unlock unlimited products, AI briefings, team collaboration, and more — free for 14 days, no charge.
        </p>
      </div>
      <a
        href="#"
        className="shrink-0 rounded-sm px-3.5 py-1.5 text-[12px] font-semibold text-lx-text transition-colors hover:bg-[#f5f5f5]"
        style={{ border: "1px solid #d0d0d0" }}
      >
        Start free trial
      </a>
    </div>
  );
}

/* ============================================================ streak card */

function StreakCard() {
  const days = Array.from({ length: 14 }, () => false);
  return (
    <div className="mb-6 rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex items-center gap-1.5 px-5 py-2.5" style={{ borderBottom: "1px solid #ebebeb" }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,4 6,8 10,4" />
        </svg>
        <span className="text-[12px] font-semibold text-lx-muted">Your streak</span>
      </div>
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="text-[22px] leading-none">🔥</span>
        <div className="flex-1">
          <p className="text-[16px] font-bold text-lx-text">0-day streak</p>
          <p className="text-[12px] text-lx-muted">7 days to your 7-day milestone</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-[3px]">
            {days.map((active, i) => (
              <div key={i} className="h-[13px] w-[13px] rounded-sm" style={{ background: active ? "#10b981" : "#efefef" }} />
            ))}
          </div>
          <a href="#" className="text-[12px] font-medium text-lx-muted hover:text-lx-text">View history →</a>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ empty state */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-6" />
        </svg>
      </div>
      <h2 className="mb-2 text-[16px] font-bold text-lx-text">Connect your first product</h2>
      <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-lx-muted">
        Add a Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack API key to see your MRR in one place.
      </p>
      <a
        href="/app/connect"
        className="inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#5e6ad2" }}
      >
        Connect a product →
      </a>
    </div>
  );
}
