"use client";
import { useState, useMemo } from "react";
import { fmtMrr } from "@/lib/format";

type Series = { date: string; value: number }[];

interface Props {
  productName: string;
  series: Series;
  color: string;
  mrr: number;
  arr: number;
  activeSubs: number;
  mrrChange30d: number;
  arpaCents: number;
  ltvCents: number;
  monthlyChurnPct: number;
  quickRatio: number | null;
  newMrrCents: number;
  churnedMrrCents: number;
  expansionMrrCents: number;
}

const PERIODS = [
  { label: "Daily",   days: 30 },
  { label: "Weekly",  days: 60 },
  { label: "Monthly", days: 90 },
];

const fmtDay = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

function niceStep(raw: number) {
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}
const tickLabel = (cents: number) =>
  fmtMrr(Math.round(cents)).replace(/\.0(?=[kM]?$)/, "");

export function ProductOverview({
  productName, series, color,
  mrr, arr, activeSubs, mrrChange30d,
  arpaCents, ltvCents, monthlyChurnPct, quickRatio,
  newMrrCents, churnedMrrCents, expansionMrrCents,
}: Props) {
  const [periodIdx, setPeriodIdx] = useState(0);
  const period = PERIODS[periodIdx];
  const slice = useMemo(() => series.slice(-period.days), [series, period.days]);

  const stats: { label: string; value: string; pct: number | null; dot?: string }[] = [
    { label: "MRR",         value: fmtMrr(mrr),                                       pct: mrrChange30d },
    { label: "ARR",         value: fmtMrr(arr),                                       pct: mrrChange30d },
    { label: "Active subs", value: activeSubs.toLocaleString(),                        pct: null },
    { label: "30d change",  value: `${mrrChange30d >= 0 ? "+" : ""}${mrrChange30d.toFixed(1)}%`, pct: mrrChange30d },
    { label: "ARPA",        value: fmtMrr(arpaCents),                                 pct: null },
    { label: "LTV",         value: fmtMrr(ltvCents),                                  pct: null },
    {
      label: "Churn",
      value: `${monthlyChurnPct.toFixed(1)}%`,
      pct: null,
      dot: monthlyChurnPct < 3 ? "#10b981" : monthlyChurnPct < 6 ? "#f59e0b" : "#e3493c",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #e5e7eb" }}>

      {/* ── filter bar ── */}
      <div className="flex h-10 items-center gap-2 border-b border-[#f0f0f0] px-4">
        {/* Site/product label */}
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-semibold text-[#111] hover:bg-[#f5f5f5]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="#f59e0b" aria-hidden>
            <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.8z"/>
          </svg>
          {productName}
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </button>

        {/* Settings */}
        <button className="rounded-md p-1.5 text-[#9ca3af] hover:bg-[#f5f5f5] hover:text-[#555]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2.2"/>
            <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M12.6 3.4l-.7.7M4.1 11.9l-.7.7"/>
          </svg>
        </button>

        {/* Prev / date range */}
        <button className="rounded-md p-1.5 text-[#9ca3af] hover:bg-[#f5f5f5]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2L4 6l4 4"/>
          </svg>
        </button>

        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-[#555] hover:bg-[#f5f5f5]"
          style={{ border: "1px solid #e5e7eb" }}>
          Last {period.days} days
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </button>

        <div className="h-3.5 w-px bg-[#e5e7eb]" />

        {/* Compare */}
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-[#9ca3af] hover:bg-[#f5f5f5]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6"/>
            <path d="M8 5v3l2 2"/>
          </svg>
          Compare
        </button>

        {/* Period toggle */}
        <div className="flex items-center gap-0 overflow-hidden rounded-md bg-[#f3f4f6] p-0.5">
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodIdx(i)}
              className={`rounded px-2.5 py-0.5 text-[11.5px] font-medium transition-colors ${
                periodIdx === i ? "bg-white text-[#111] shadow-sm" : "text-[#9ca3af] hover:text-[#555]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <button className="rounded-md p-1.5 text-[#9ca3af] hover:bg-[#f5f5f5]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M5 8h6M7 12h2"/>
          </svg>
        </button>

        {/* Refresh */}
        <button className="rounded-md p-1.5 text-[#9ca3af] hover:bg-[#f5f5f5]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 8A5.5 5.5 0 0 1 3 11.2"/>
            <path d="M2.5 8A5.5 5.5 0 0 1 13 4.8"/>
            <path d="M2.5 12.5V8H7"/>
            <path d="M13.5 3.5V8H9"/>
          </svg>
        </button>
      </div>

      {/* ── stats strip ── */}
      <div className="flex items-start justify-between border-b border-[#f0f0f0] px-5 py-4">
        {stats.map((s) => {
          const up = (s.pct ?? 0) > 0;
          const down = (s.pct ?? 0) < 0;
          return (
            <div key={s.label} className="min-w-0">
              <p className="text-[11px] text-[#9ca3af]">{s.label}</p>
              <p className="mt-0.5 text-[22px] font-bold leading-tight tabular-nums text-[#111]"
                style={{ letterSpacing: "-0.02em" }}>
                {s.value}
                {s.dot && (
                  <span className="ml-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: s.dot }} />
                )}
              </p>
              {s.pct !== null && (
                <p className="mt-0.5 text-[11px] font-medium tabular-nums" style={{ color: up ? "#10b981" : down ? "#e3493c" : "#9ca3af" }}>
                  {Math.abs(s.pct).toFixed(0)}%{" "}
                  <span>{up ? "↑" : down ? "↓" : "→"}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── charts ── */}
      <div className="px-5 pt-4 pb-2">
        <LineChart series={slice} color={color} />
      </div>
      <div className="px-5 pb-4">
        <BarChart series={slice} color={color} />
      </div>
    </div>
  );
}

/* ─── line chart ─── */
function LineChart({ series, color }: { series: Series; color: string }) {
  const data = series.map((s) => s.value);
  if (data.length < 2) return null;

  const W = 960, H = 220;
  const padL = 48, padR = 8, padTop = 20, padBot = 6;
  const innerW = W - padL - padR;
  const innerH = H - padTop - padBot;

  const lo = Math.min(...data), hi = Math.max(...data);
  const step = niceStep((hi - lo || hi * 0.2 || 1) / 3);
  const tickLo = Math.floor(lo / step) * step;
  const tickHi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = tickLo; t <= tickHi + step * 1e-6; t += step) ticks.push(t);
  const min = tickLo - step * 0.25;
  const max = tickHi + step * 0.1;
  const range = max - min;

  const px = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const py = (v: number) => padTop + (1 - (v - min) / range) * innerH;
  const pts = data.map((v, i) => [px(i), py(v)] as [number, number]);

  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i];
    const p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}`;
    d += ` ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}`;
    d += ` ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  const floor = padTop + innerH;
  const area = `${d} L ${pts[pts.length - 1][0].toFixed(1)},${floor} L ${pts[0][0].toFixed(1)},${floor} Z`;
  const uid = color.replace(/[^a-z0-9]/gi, "");

  const nLabels = Math.min(6, data.length);
  const labelAt = [...new Set(Array.from({ length: nLabels }, (_, i) => Math.round((i / (nLabels - 1)) * (data.length - 1))))];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }} aria-hidden>
      <defs>
        <linearGradient id={`area-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="80%" stopColor={color} stopOpacity="0.02" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks on left */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={py(t)} y2={py(t)}
            stroke="#f3f4f6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <text x={padL - 6} y={py(t) + 4} fontSize="11" fill="#d1d5db"
            fontWeight="500" textAnchor="end">
            {tickLabel(t)}
          </text>
        </g>
      ))}

      {/* Area + line */}
      <path d={area} fill={`url(#area-${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      {/* End dot */}
      {(() => {
        const last = pts[pts.length - 1];
        return <>
          <circle cx={last[0]} cy={last[1]} r="8" fill={color} opacity="0.12" />
          <circle cx={last[0]} cy={last[1]} r="3" fill={color} stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </>;
      })()}

      {/* X-axis date labels */}
      {labelAt.map((i) => (
        <text key={i} x={px(i)} y={H - 2}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize="10.5" fill="#d1d5db" fontWeight="500">
          {fmtDay(series[i].date)}
        </text>
      ))}
    </svg>
  );
}

/* ─── bar chart ─── */
function BarChart({ series, color }: { series: Series; color: string }) {
  const data = series.map((s) => s.value);
  if (data.length < 2) return null;

  const W = 960, H = 100;
  const padL = 48, padR = 8, padTop = 4, padBot = 20;
  const innerW = W - padL - padR;
  const innerH = H - padTop - padBot;
  const n = data.length;
  const gap = 2;
  const barW = Math.max(2, (innerW / n) - gap);
  const maxVal = Math.max(...data, 1);

  // two-tone: darker base + lighter top (like reference)
  const baseRatio = 0.65; // bottom 65% of each bar is the "base" darker color

  const nLabels = Math.min(6, n);
  const labelAt = [...new Set(Array.from({ length: nLabels }, (_, i) => Math.round((i / (nLabels - 1)) * (n - 1))))];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }} aria-hidden>
      {data.map((v, i) => {
        if (v === 0) return null;
        const x = padL + (i / n) * innerW + gap / 2;
        const h = (v / maxVal) * innerH;
        const y = padTop + innerH - h;
        const baseH = h * baseRatio;
        const topH = h - baseH;
        return (
          <g key={i}>
            {/* top (lighter) */}
            <rect x={x} y={y} width={barW} height={topH} rx="2" fill={color} opacity="0.28" />
            {/* base (darker) */}
            <rect x={x} y={y + topH} width={barW} height={baseH} rx="1" fill={color} opacity="0.7" />
          </g>
        );
      })}

      {/* X-axis labels (match line chart) */}
      {labelAt.map((i) => (
        <text key={i}
          x={padL + (i / n) * innerW + barW / 2}
          y={H - 4}
          textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
          fontSize="10.5" fill="#d1d5db" fontWeight="500">
          {fmtDay(series[i].date)}
        </text>
      ))}
    </svg>
  );
}
