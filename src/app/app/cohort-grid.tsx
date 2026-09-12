import type { CohortRow } from "@/lib/analytics";

function heat(pct: number, color: string): string {
  const a = 0.06 + (Math.min(100, pct) / 100) * 0.62;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export function CohortGrid({ rows, color = "#5e6ad2" }: { rows: CohortRow[]; color?: string }) {
  if (rows.length === 0) {
    return <div className="px-7 pb-7 text-[13px] text-lx-faint">Not enough history yet.</div>;
  }
  const cols = Math.max(...rows.map((r) => r.retention.length));

  return (
    <div className="overflow-x-auto px-7 pb-7">
      <table className="w-full border-separate" style={{ borderSpacing: "3px" }}>
        <thead>
          <tr>
            <th className="pb-1 pr-3 text-left text-[10px] font-semibold uppercase tracking-wider text-lx-faint">Cohort</th>
            <th className="pb-1 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-lx-faint">Subs</th>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} className="pb-1 text-center text-[10px] font-semibold tabular-nums text-lx-faint" style={{ minWidth: 42 }}>
                m{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cohort}>
              <td className="whitespace-nowrap pr-3 text-[12px] font-semibold text-lx-text">{r.label}</td>
              <td className="pr-3 text-right text-[12px] tabular-nums text-lx-muted">{r.customers.toLocaleString()}</td>
              {Array.from({ length: cols }, (_, i) => {
                const v = r.retention[i];
                if (v === null || v === undefined) {
                  return <td key={i} className="rounded-md" style={{ background: "#faf9f7" }} />;
                }
                return (
                  <td
                    key={i}
                    className="rounded-md py-1.5 text-center text-[11px] font-semibold tabular-nums"
                    style={{ background: heat(v, color), color: v > 55 ? "#ffffff" : "#4a4744" }}
                  >
                    {v.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
