import { fmtMrr } from "@/lib/metrics";

export function TrendChart({
  series,
  height = 220,
  color = "#5e6ad2",
}: {
  series: { date: string; value: number }[];
  height?: number;
  color?: string;
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

  const gradId = `trend-${color.replace("#", "")}`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ height, display: "block" }} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
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
      <path d={area} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} stroke="#ffffff" strokeWidth="2" />
      {labelAt.map((i) => (
        <text key={i} x={px(i)} y={h - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="10" fill="#9c9894" fontWeight="500">
          {fmtDay(series[i].date)}
        </text>
      ))}
    </svg>
  );
}
