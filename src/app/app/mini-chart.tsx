"use client";

import { fmtMrr } from "@/lib/format";

export function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const w = 480;
  const h = 120;
  const padX = 6;
  const padTop = 10;
  const padBottom = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const innerH = h - padTop - padBottom;
  const x = (i: number) => padX + (i / (data.length - 1)) * (w - padX * 2);
  const y = (v: number) => padTop + (1 - (v - min) / range) * innerH;
  const pts = data.map((v, i) => [x(i), y(v)] as [number, number]);

  // Catmull-Rom -> cubic bezier for a smooth curve
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
  const area = `${d} L ${pts[pts.length - 1][0].toFixed(1)},${h} L ${pts[0][0].toFixed(1)},${h} Z`;
  const last = pts[pts.length - 1];
  const gid = `mg-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[10px] font-semibold tabular-nums">
        <span style={{ color: "#c8c4bc" }}>{fmtMrr(data[0])}</span>
        <span style={{ color }}>{fmtMrr(data[data.length - 1])}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: 96, display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={w - padX}
            y1={padTop + f * innerH}
            y2={padTop + f * innerH}
            stroke="#ebebeb"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={d} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={pts[0][0]} cy={pts[0][1]} r="2.5" fill="#ffffff" stroke={color} strokeWidth="1.5" />
        <circle cx={last[0]} cy={last[1]} r="4" fill={color} stroke="#ffffff" strokeWidth="2" />
      </svg>
    </div>
  );
}
