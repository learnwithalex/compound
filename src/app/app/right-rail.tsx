import { fmtMrr, productIcon, providerLogo } from "@/lib/format";
import { milestoneFor } from "@/lib/insights";
import type { PortfolioActivityItem } from "@/lib/analytics";
import type { ProductMetrics } from "@/lib/metrics";

function ago(date: Date): string {
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 90) return "just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const EVENT = {
  new: { verb: "subscribed", glyph: "+", positive: true },
  expansion: { verb: "upgraded", glyph: "↑", positive: true },
  reactivation: { verb: "came back", glyph: "↺", positive: true },
  contraction: { verb: "downgraded", glyph: "↓", positive: false },
  churn: { verb: "canceled", glyph: "−", positive: false },
} as const;

const fallback = EVENT.new;

export function RailCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm bg-white p-4" style={{ border: "1px solid #ebebeb" }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{title}</p>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- activity */

export function ActivityFeed({ items }: { items: PortfolioActivityItem[] }) {
  return (
    <RailCard
      title="Live activity"
      right={<span className="h-1.5 w-1.5 rounded-full" style={{ background: "#10b981" }} />}
    >
      {items.length === 0 ? (
        <p className="text-[12px] text-lx-muted">Nothing yet — movements show up here as they sync.</p>
      ) : (
        <ul className="-mx-1 space-y-0.5">
          {items.map((item, i) => {
            const e = EVENT[item.eventType as keyof typeof EVENT] ?? fallback;
            return (
              <li key={`${item.occurredAt.toISOString()}-${i}`} className="flex items-start gap-2.5 px-1 py-1.5">
                <span className="mt-[3px] w-2 shrink-0 text-center text-[11px] font-semibold text-lx-faint">
                  {e.glyph}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-lx-text">
                    {item.customerName}
                  </span>
                  <span className="block truncate text-[11px] text-lx-faint">
                    {e.verb} · {item.planName ?? item.productLabel} · {ago(item.occurredAt)}
                  </span>
                </span>

                <span
                  className="shrink-0 pt-0.5 text-[11.5px] font-semibold tabular-nums"
                  style={{ color: e.positive ? "#0f9b6c" : "#c8392c" }}
                >
                  {e.positive ? "+" : "−"}{fmtMrr(item.amountCents)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </RailCard>
  );
}

/* -------------------------------------------------------------- milestones */

export function MilestoneRail({ products }: { products: ProductMetrics[] }) {
  const ranked = [...products].sort((a, b) => b.mrrCents - a.mrrCents);

  return (
    <RailCard
      title="Milestones"
      right={
        <span className="text-[11px] text-lx-faint">
          {ranked.reduce((sum, p) => sum + milestoneFor(p.mrrCents).crossed, 0)} crossed
        </span>
      }
    >
      <div className="space-y-3.5">
        {ranked.map((p) => {
          const m = milestoneFor(p.mrrCents);
          const done = m.pct >= 100;
          return (
            <div key={p.connectionId}>
              <div className="flex items-center gap-2">
                <img
                  src={productIcon(p.label, p.provider)}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0 rounded object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-lx-text">{p.label}</span>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums" style={{ color: done ? "#0f9b6c" : "#9a9a9a" }}>
                  {done ? "Hit" : `${m.pct.toFixed(0)}%`}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full" style={{ background: "#f0f0f0" }}>
                <div
                  className="grow-bar h-full rounded-full"
                  style={{ width: `${done ? 100 : m.pct}%`, background: done ? "#0f9b6c" : "#5e6ad2" }}
                />
              </div>
              <p className="mt-1 text-[10.5px] text-lx-faint">
                {fmtMrr(m.toGoCents)} to {fmtMrr(m.nextCents)}
              </p>
            </div>
          );
        })}
      </div>
    </RailCard>
  );
}

/* ------------------------------------------------------------------- sync */

export function SyncStatus({
  connections,
}: {
  connections: { id: string; label: string; provider: string; lastSyncedAt: Date | null }[];
}) {
  return (
    <RailCard title="Sources">
      <ul className="space-y-2.5">
        {connections.map((c) => (
          <li key={c.id} className="flex items-center gap-2.5">
            <img
              src={providerLogo(c.provider)}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 rounded-full bg-white object-cover"
              style={{ border: "1px solid #ebebeb" }}
              loading="lazy"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-medium text-lx-text">{c.label}</span>
              <span className="block text-[10.5px] text-lx-faint">
                {c.lastSyncedAt ? `synced ${ago(c.lastSyncedAt)}` : "never synced"}
              </span>
            </span>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: c.lastSyncedAt ? "#10b981" : "#dcdcdc" }}
            />
          </li>
        ))}
      </ul>

      <a
        href="/app/connect"
        className="mt-3.5 flex items-center justify-center gap-1.5 rounded-sm py-2 text-[12px] font-semibold text-lx-muted transition-colors hover:text-lx-text"
        style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
      >
        + Connect another
      </a>
    </RailCard>
  );
}
