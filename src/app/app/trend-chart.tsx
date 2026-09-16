import { fmtMrr } from "@/lib/format";

/** 1 / 2 / 2.5 / 5 / 10 x a power of ten — the steps that read as round money. */
function niceStep(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

const tickLabel = (cents: number) => fmtMrr(Math.round(cents)).replace(/\.0(?=[kM]?$)/, "");

const fmtDay = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function TrendChart({
  series,
  height = 240,
  color = "#5e6ad2",
  animate = false,
}: {
  series: { date: string; value: number }[];
  height?: number;
  color?: string;
  animate?: boolean;
}) {
  const data = series.map((s) => s.value);
  const w = 960;
  const h = height;
  const padX = 18;
  const padTop = 22;
  const padBottom = 30;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;

  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const step = niceStep((hi - lo || hi * 0.2 || 1) / 3);
  const tickLo = Math.floor(lo / step) * step;
  const tickHi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = tickLo; t <= tickHi + step * 1e-6; t += step) ticks.push(t);

  // Headroom below the lowest tick keeps the fill off the floor, and above the
  // highest keeps the end dot from clipping the card edge.
  const min = tickLo - step * 0.5;
  const max = tickHi + step * 0.2;
  const range = max - min;

  const px = (i: number) => padX + (i / Math.max(1, data.length - 1)) * innerW;
  const py = (v: number) => padTop + (1 - (v - min) / range) * innerH;
  const pts = data.map((v, i) => [px(i), py(v)] as [number, number]);

  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}`;
    d += ` ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}`;
    d += ` ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  const floor = padTop + innerH;
  const area = `${d} L ${pts[pts.length - 1][0].toFixed(1)},${floor} L ${pts[0][0].toFixed(1)},${floor} Z`;
  const last = pts[pts.length - 1];

  const nLabels = Math.min(6, data.length);
  const labelAt = [...new Set(
    Array.from({ length: nLabels }, (_, i) => Math.round((i / (nLabels - 1)) * (data.length - 1))),
  )];

  const uid = color.replace("#", "");

  return (
    // Uniform scaling: the viewBox aspect drives the rendered height, so text
    // and the end dot never stretch on wide containers.
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", aspectRatio: `${w} / ${h}` }} aria-hidden>
      <defs>
        <linearGradient id={`fill-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="55%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padX}
            x2={w - padX}
            y1={py(t)}
            y2={py(t)}
            stroke="#e9e5de"
            strokeWidth="1"
            strokeDasharray="2 5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Halo keeps the label readable where the series runs behind it. */}
          <text
            x={padX}
            y={py(t) - 7}
            fontSize="11"
            fill="#a8a39b"
            fontWeight="500"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {tickLabel(t)}
          </text>
        </g>
      ))}

      <line x1={padX} x2={w - padX} y1={floor} y2={floor} stroke="#ebebeb" strokeWidth="1" vectorEffect="non-scaling-stroke" />

      <path d={area} fill={`url(#fill-${uid})`} className={animate ? "draw-area" : undefined} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={animate ? "draw-line" : undefined}
        pathLength={animate ? 1 : undefined}
      />

      <circle cx={last[0]} cy={last[1]} r="9" fill={color} opacity="0.14" className={animate ? "ping-ring" : undefined} />
      <circle cx={last[0]} cy={last[1]} r="4" fill={color} stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />

      {labelAt.map((i) => (
        <text
          key={i}
          x={px(i)}
          y={h - 9}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize="11"
          fill="#a8a39b"
          fontWeight="500"
        >
          {fmtDay(series[i].date)}
        </text>
      ))}
    </svg>
  );
}

/* ============================================================ card shell */

export function ChartCard({
  label,
  caption,
  series,
  color = "#5e6ad2",
  height = 260,
  emptyHint = "Sync daily to build your trend",
  className = "",
}: {
  label: string;
  caption?: string;
  series: { date: string; value: number }[];
  color?: string;
  height?: number;
  emptyHint?: string;
  className?: string;
}) {
  const values = series.map((s) => s.value);
  const ready = values.length > 1;
  const latest = ready ? values[values.length - 1] : 0;
  const first = ready ? values[0] : 0;
  const pct = ready && first > 0 ? ((latest - first) / first) * 100 : 0;
  const up = pct >= 0;

  return (
    <section className={`overflow-hidden rounded-sm bg-white ${className}`} style={{ border: "1px solid #ebebeb" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 px-7 pb-5 pt-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">{label}</p>
          <div className="mt-2 flex items-center gap-2.5">
            <p className="text-[30px] font-bold leading-none tabular-nums text-lx-text" style={{ letterSpacing: "-0.03em" }}>
              {fmtMrr(latest)}
            </p>
            {ready && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums"
                style={{
                  color: up ? "#0f9b6c" : "#d0392c",
                  background: up ? "rgba(16,185,129,0.10)" : "rgba(227,73,60,0.10)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
                </svg>
                {Math.abs(pct).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {caption && <p className="text-[11px] font-medium text-lx-faint">{caption}</p>}
      </div>

      {ready ? (
        <TrendChart series={series} height={height} color={color} />
      ) : (
        <div className="mx-7 mb-7 flex h-[160px] items-center justify-center rounded-sm text-[13px] text-lx-faint" style={{ background: "#fafafa" }}>
          {emptyHint}
        </div>
      )}

      {ready && (
        <div className="grid grid-cols-3" style={{ borderTop: "1px solid #f0f0f0" }}>
          <Foot label="Low" value={fmtMrr(Math.min(...values))} />
          <Foot label="Average" value={fmtMrr(Math.round(values.reduce((a, b) => a + b, 0) / values.length))} divider />
          <Foot label="High" value={fmtMrr(Math.max(...values))} divider />
        </div>
      )}
    </section>
  );
}

function Foot({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className="px-7 py-3.5" style={divider ? { borderLeft: "1px solid #f0f0f0" } : undefined}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      <p className="mt-1 text-[14px] font-semibold tabular-nums text-lx-text">{value}</p>
    </div>
  );
}
