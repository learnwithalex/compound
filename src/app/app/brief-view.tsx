"use client";
import { fmtMrr, productIcon } from "@/lib/format";
import type { PortfolioMetrics } from "@/lib/metrics";
import type { Brief, BriefCallout } from "@/lib/brief";
import { ChartCard } from "./trend-chart";
import { IconMrr, IconArr, IconSubs, IconTrend, IconQuick } from "./stat-icons";

const MOOD = {
  growing: { label: "Growing", text: "#0f9b6c", bg: "rgba(16,185,129,0.10)", ring: "rgba(16,185,129,0.28)" },
  steady: { label: "Holding steady", text: "#8a6d1f", bg: "rgba(242,176,48,0.12)", ring: "rgba(242,176,48,0.30)" },
  shrinking: { label: "Shrinking", text: "#c8392c", bg: "rgba(227,73,60,0.10)", ring: "rgba(227,73,60,0.28)" },
} as const;

const MOOD_EMOJI = { growing: "🚀", steady: "🙂", shrinking: "📉" } as const;

const KIND = {
  win: { label: "Working", text: "#0b3d2e", bg: "#baffc9", badge: "#15803d", ring: "rgba(21,128,61,0.22)" },
  risk: { label: "Watch", text: "#4a0e08", bg: "#ffc1b6", badge: "#b91c1c", ring: "rgba(185,28,28,0.22)" },
} as const;

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function toMarkdown(brief: Brief, metrics: PortfolioMetrics): string {
  const lines = [
    `# ${brief.headline}`,
    "",
    `_${MOOD[brief.mood].label} · generated ${stamp(brief.generatedAt)} by Compound_`,
    "",
    brief.summary,
    "",
    "## Portfolio",
    `- Total MRR: ${fmtMrr(metrics.totalMrrCents)}`,
    `- Total ARR: ${fmtMrr(metrics.totalArrCents)}`,
    `- Net new MRR (30d): ${fmtMrr(metrics.netNewMrrCents)}`,
    `- Active subscriptions: ${metrics.totalActiveSubscriptions.toLocaleString()}`,
    "",
  ];

  if (brief.callouts.length > 0) {
    lines.push("## What stood out", "");
    for (const c of brief.callouts) lines.push(`- **[${KIND[c.kind].label}] ${c.title}** — ${c.detail}`);
    lines.push("");
  }

  if (brief.actions.length > 0) {
    lines.push("## Do this week", "");
    brief.actions.forEach((a, i) => lines.push(`${i + 1}. **${a.title}** — ${a.detail}`));
    lines.push("");
  }

  lines.push("## Products", "");
  for (const p of [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents)) {
    const trend = `${p.mrrChange30d > 0 ? "+" : ""}${p.mrrChange30d.toFixed(1)}%`;
    lines.push(`- ${p.label} — ${fmtMrr(p.mrrCents)} MRR, ${p.activeSubscriptions} subs, ${trend} over 30d`);
  }

  return lines.join("\n");
}

function download(brief: Brief, metrics: PortfolioMetrics) {
  const url = URL.createObjectURL(new Blob([toMarkdown(brief, metrics)], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `compound-brief-${brief.generatedAt.slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BriefView({
  brief,
  metrics,
  series,
  onBack,
}: {
  brief: Brief;
  metrics: PortfolioMetrics;
  series: { date: string; value: number }[];
  onBack: () => void;
}) {
  const mood = MOOD[brief.mood];
  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);
  const top = ranked[0]?.mrrCents ?? 1;
  const byId = new Map(metrics.products.map((p) => [p.connectionId, p]));

  return (
    <div className="brief-anim pb-14">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-sm bg-white px-3 py-1.5 text-[12px] font-semibold text-lx-muted transition-colors hover:text-lx-text"
          style={{ border: "1px solid #ebebeb" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to dashboard
        </button>

        <button
          onClick={() => download(brief, metrics)}
          className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1c1c22" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
          </svg>
          Download
        </button>
      </div>

      {/* Hero */}
      <section
        className="mb-3 overflow-hidden rounded-sm px-5 py-5"
        style={{ background: "#ffffff", border: "1px solid #ebebeb" }}
      >
        <div className="flex items-start gap-3.5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[20px]"
            style={{ background: mood.bg, boxShadow: `inset 0 0 0 1px ${mood.ring}` }}
          >
            {MOOD_EMOJI[brief.mood]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white" style={{ background: "#5e6ad2" }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l1.2 4.8L12 6l-4.8 1.2L6 12 4.8 7.2 0 6l4.8-1.2z" /></svg>
                AI briefing
              </span>
              <span className="text-[10px] font-semibold" style={{ color: mood.text }}>{mood.label}</span>
              <span className="text-[10px] text-lx-faint">· {stamp(brief.generatedAt)}</span>
            </div>

            <h2 className="mt-2 max-w-2xl text-[19px] font-bold leading-[1.25] text-lx-text" style={{ letterSpacing: "-0.02em" }}>
              {brief.headline}
            </h2>
            {brief.summary && (
              <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-lx-muted">
                {brief.summary}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-sm sm:grid-cols-2 lg:grid-cols-4" style={{ background: "#ebebeb" }}>
          <HeroStat label="MRR" value={fmtMrr(metrics.totalMrrCents)} icon={IconMrr} />
          <HeroStat label="ARR" value={fmtMrr(metrics.totalArrCents)} icon={IconArr} />
          <HeroStat
            label="Net new · 30d"
            value={`${metrics.netNewMrrCents >= 0 ? "+" : "−"}${fmtMrr(Math.abs(metrics.netNewMrrCents))}`}
            icon={IconTrend}
            color={metrics.netNewMrrCents >= 0 ? "#0f9b6c" : "#c8392c"}
          />
          <HeroStat label="Active subs" value={metrics.totalActiveSubscriptions.toLocaleString()} icon={IconSubs} />
        </div>
      </section>

      {/* Callouts */}
      {brief.callouts.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {brief.callouts.map((c, i) => (
            <Callout key={i} callout={c} product={c.connectionId ? byId.get(c.connectionId) : undefined} />
          ))}
        </div>
      )}

      {/* Evidence */}
      <ChartCard
        className="mb-4"
        label="Monthly recurring revenue"
        caption="Last 90 days · all products"
        series={series}
        height={260}
      />

      {/* Actions */}
      {brief.actions.length > 0 && (
        <section className="mb-4 rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
          <p className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
            <IconQuick /> Do this week
          </p>
          <ol className="space-y-2.5">
            {brief.actions.map((a, i) => (
              <li key={i} className="flex gap-3 rounded-sm px-4 py-3" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#5e6ad2" }}>
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-lx-text">{a.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-lx-muted">{a.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Leaderboard */}
      <section className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
          What the brief is reading · {ranked.length} product{ranked.length === 1 ? "" : "s"}
        </p>
        <div className="space-y-2.5">
          {ranked.map((p) => {
            const up = p.mrrChange30d > 0;
            const flat = p.mrrChange30d === 0;
            return (
              <a key={p.connectionId} href={`/app/products/${p.connectionId}?name=${encodeURIComponent(p.label)}`} className="flex items-center gap-3 rounded-sm px-1 py-1 transition-colors hover:bg-[#fafafa]">
                <img
                  src={productIcon(p.label, p.provider)}
                  alt=""
                  width={26}
                  height={26}
                  className="h-[26px] w-[26px] shrink-0 rounded-sm object-cover"
                  style={{ border: "1px solid #ebebeb" }}
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold text-lx-text">{p.label}</span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full" style={{ background: "#f0f0f0" }}>
                    <span className="block h-full rounded-full" style={{ width: `${Math.max(3, (p.mrrCents / top) * 100)}%`, background: p.color }} />
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[13px] font-bold tabular-nums text-lx-text">{fmtMrr(p.mrrCents)}</span>
                  <span
                    className="block text-[10px] font-semibold tabular-nums"
                    style={{ color: flat ? "#a8a39b" : up ? "#0f9b6c" : "#c8392c" }}
                  >
                    {up ? "+" : ""}{p.mrrChange30d.toFixed(1)}% · 30d
                  </span>
                </span>
              </a>
            );
          })}
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-lx-faint">
          Written by Claude from your live numbers. It can be wrong about causes — the figures above are the source of truth.
        </p>
      </section>
    </div>
  );
}

function HeroStat({
  label, value, icon: Icon, color,
}: { label: string; value: string; icon: () => React.ReactElement; color?: string }) {
  return (
    <div className="px-3.5 py-2.5" style={{ background: "#fafafa" }}>
      <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
        <Icon /> {label}
      </p>
      <p className="mt-1 text-[16px] font-bold tabular-nums" style={{ color: color ?? "#1c1c22", letterSpacing: "-0.02em" }}>
        {value}
      </p>
    </div>
  );
}

function Callout({ callout: c, product }: { callout: BriefCallout; product?: PortfolioMetrics["products"][number] }) {
  const tone = KIND[c.kind];
  return (
    <div
      className="rounded-sm px-5 py-4 transition-transform hover:-translate-y-0.5"
      style={{ background: tone.bg, border: "2px solid #1c1c22", boxShadow: "4px 4px 0 #1c1c22" }}
    >
      <div className="mb-2 flex items-center gap-2">
        {product ? (
          <img
            src={productIcon(product.label, product.provider)}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px] shrink-0 rounded-sm bg-white object-cover"
            style={{ border: "2px solid #1c1c22" }}
            loading="lazy"
          />
        ) : (
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-sm bg-white" style={{ border: "2px solid #1c1c22" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1c1c22" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>
          </span>
        )}
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-[3px] text-[10px] font-semibold"
          style={{ color: tone.badge, boxShadow: `inset 0 0 0 1px ${tone.ring}` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.badge }} />
          {tone.label}
        </span>
        {product && <span className="truncate text-[11px] font-bold" style={{ color: tone.text }}>{product.label}</span>}
      </div>
      <p className="text-[13px] font-extrabold" style={{ color: tone.text }}>{c.title}</p>
      <p className="mt-1 text-[12px] font-medium leading-relaxed" style={{ color: tone.text }}>{c.detail}</p>
    </div>
  );
}
