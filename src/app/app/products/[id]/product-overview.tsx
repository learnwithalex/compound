"use client";
import { useState, useMemo } from "react";
import { fmtMrr } from "@/lib/format";

/* ─── types ─── */
type Series = { date: string; value: number }[];

interface Props {
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

/* ─── helpers ─── */
const fmtDay = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

function niceStep(raw: number) {
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}
const tickLabel = (cents: number) =>
  fmtMrr(Math.round(cents)).replace(/\.0(?=[kM]?$)/, "");

const PERIODS = [
  { label: "30D", days: 30 },
  { label: "60D", days: 60 },
  { label: "90D", days: 90 },
];

/* ─── main export ─── */
export function ProductOverview({
  series, color, mrr, arr, activeSubs, mrrChange30d,
  arpaCents, ltvCents, monthlyChurnPct, quickRatio,
  newMrrCents, churnedMrrCents, expansionMrrCents,
}: Props) {
  const [period, setPeriod] = useState(30);

  const slice = useMemo(() => series.slice(-period), [series, period]);

  const stats = [
    { label: "MRR",          value: fmtMrr(mrr),                    pct: mrrChange30d,               raw: mrr },
    { label: "ARR",          value: fmtMrr(arr),                    pct: mrrChange30d,               raw: arr },
    { label: "Active subs",  value: activeSubs.toLocaleString(),     pct: null,                       raw: activeSubs },
    { label: "30d change",   value: `${mrrChange30d >= 0 ? "+" : ""}${mrrChange30d.toFixed(1)}%`, pct: mrrChange30d, raw: mrrChange30d },
    { label: "ARPA",         value: fmtMrr(arpaCents),              pct: null,                       raw: arpaCents },
    { label: "LTV",          value: fmtMrr(ltvCents),               pct: null,                       raw: ltvCents },
    { label: "Churn",        value: `${monthlyChurnPct.toFixed(1)}%`, pct: monthlyChurnPct > 5 ? -monthlyChurnPct : null, raw: monthlyChurnPct },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #ebebeb" }}>

      {/* ── filter bar ── */}
      <div className="flex items-center gap-3 border-b border-[#f0f0f0] px-5 py-2.5">
        <div className="flex items-center gap-1 rounded-md bg-[#f5f5f5] p-0.5">
          {PERIODS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`rounded px-3 py-1 text-[12px] font-medium transition-colors ${
                period === days
                  ? "bg-white text-[#111111] shadow-sm"
                  : "text-[#8a8a8a] hover:text-[#565656]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 text-[12px] text-[#a0a0a0]">
          <span>Last {period} days</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8zM8 5v3l2 2" />
          </svg>
        </div>
      </div>

      {/* ── stats strip ── */}
      <div className="grid border-b border-[#f0f0f0]" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
        {stats.map((s, i) => {
          const up = (s.pct ?? 0) > 0;
          const hasPct = s.pct !== null && s.label !== "30d change";
          return (
            <div
              key={s.label}
              className="px-4 py-4"
              style={i > 0 ? { borderLeft: "1px solid #f0f0f0" } : undefined}
            >
              <p className="text-[11px] font-medium text-[#a0a0a0]">{s.label}</p>
              <p className="mt-1.5 text-[19px] font-bold tabular-nums text-[#111111]" style={{ letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
              {hasPct && s.pct !== null && (
                <div className="mt-1 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
                    stroke={up ? "#10b981" : "#e3493c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {up
                      ? <path d="M6 10V2M2 6l4-4 4 4" />
                      : <path d="M6 2v8M2 6l4 4 4-4" />}
                  </svg>
                  <span className="text-[11px] font-medium tabular-nums" style={{ color: up ? "#10b981" : "#e3493c" }}>
                    {Math.abs(s.pct).toFixed(1)}%
                  </span>
                </div>
              )}
              {s.label === "30d change" && (
                <div className="mt-1 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
                    stroke={mrrChange30d >= 0 ? "#10b981" : "#e3493c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {mrrChange30d >= 0
                      ? <path d="M6 10V2M2 6l4-4 4 4" />
                      : <path d="M6 2v8M2 6l4 4 4-4" />}
                  </svg>
                  <span className="text-[11px] font-medium" style={{ color: mrrChange30d >= 0 ? "#10b981" : "#e3493c" }}>
                    vs. prev period
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── line chart ── */}
      <div className="px-5 pt-5">
        <LineChart series={slice} color={color} />
      </div>

      {/* ── bar chart ── */}
      <div className="px-5 pb-5">
        <BarChart series={slice} color={color} />
      </div>

      {/* ── movement footer ── */}
      <div className="grid grid-cols-3 border-t border-[#f0f0f0]">
        {[
          { label: "New MRR",       value: fmtMrr(newMrrCents),       color: "#10b981", bg: "rgba(16,185,129,0.07)" },
          { label: "Churned MRR",   value: fmtMrr(churnedMrrCents),   color: "#e3493c", bg: "rgba(227,73,60,0.07)" },
          { label: "Expansion MRR", value: fmtMrr(expansionMrrCents), color: "#5e6ad2", bg: "rgba(94,106,210,0.07)" },
        ].map((m, i) => (
          <div
            key={m.label}
            className="flex items-center gap-3 px-5 py-3.5"
            style={i > 0 ? { borderLeft: "1px solid #f0f0f0" } : undefined}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: m.color }} />
            <span className="text-[12px] text-[#8a8a8a]">{m.label}</span>
            <span className="ml-auto text-[13px] font-semibold tabular-nums text-[#111111]">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── line chart ─── */
function LineChart({ series, color }: { series: Series; color: string }) {
  const data = series.map((s) => s.value);
  if (data.length < 2) return null;

  const W = 960, H = 200, padX = 4, padTop = 16, padBot = 28;
  const innerW = W - padX * 2, innerH = H - padTop - padBot;

  const lo = Math.min(...data), hi = Math.max(...data);
  const step = niceStep((hi - lo || hi * 0.2 || 1) / 3);
  const tickLo = Math.floor(lo / step) * step;
  const tickHi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = tickLo; t <= tickHi + step * 1e-6; t += step) ticks.push(t);
  const min = tickLo - step * 0.3, max = tickHi + step * 0.15, range = max - min;

  const px = (i: number) => padX + (i / (data.length - 1)) * innerW;
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
  const last = pts[pts.length - 1];
  const uid = color.replace("#", "");

  const nLabels = Math.min(6, data.length);
  const labelAt = [...new Set(Array.from({ length: nLabels }, (_, i) => Math.round((i / (nLabels - 1)) * (data.length - 1))))];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }} aria-hidden>
      <defs>
        <linearGradient id={`lg-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="70%" stopColor={color} stopOpacity="0.04" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padX} x2={W - padX} y1={py(t)} y2={py(t)} stroke="#f0f0f0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <text x={padX + 4} y={py(t) - 5} fontSize="10" fill="#c0c0c0" fontWeight="500"
            stroke="#fff" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">
            {tickLabel(t)}
          </text>
        </g>
      ))}
      <path d={area} fill={`url(#lg-${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="10" fill={color} opacity="0.12" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {labelAt.map((i) => (
        <text key={i} x={px(i)} y={H - 8}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize="10" fill="#b0b0b0" fontWeight="500">
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

  // Day-over-day deltas
  const deltas = data.map((v, i) => (i === 0 ? 0 : v - data[i - 1]));
  const maxAbs = Math.max(...deltas.map(Math.abs), 1);

  const W = 960, H = 80, barGap = 2;
  const barW = Math.max(2, (W / deltas.length) - barGap);
  const midY = H / 2;

  const hex = color; // positive color
  const negColor = "#e3493c";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }} aria-hidden>
      <line x1="0" x2={W} y1={midY} y2={midY} stroke="#f0f0f0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      {deltas.map((d, i) => {
        if (d === 0) return null;
        const x = (i / deltas.length) * W + barGap / 2;
        const h = Math.abs(d) / maxAbs * (midY - 6);
        const pos = d > 0;
        const y = pos ? midY - h : midY;
        return (
          <rect
            key={i}
            x={x} y={y} width={barW} height={h}
            rx="1.5"
            fill={pos ? hex : negColor}
            opacity={pos ? 0.75 : 0.5}
          />
        );
      })}
    </svg>
  );
}
