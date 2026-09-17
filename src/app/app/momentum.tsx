import { fmtMrr } from "@/lib/format";
import { milestoneFor } from "@/lib/insights";

const fmtDay = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

function upStreak(values: number[]): number {
  let n = 0;
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i] >= values[i - 1]) n++;
    else break;
  }
  return n;
}

function streakStart(series: { date: string; value: number }[], streak: number): string {
  if (streak <= 0) return "";
  const idx = series.length - 1 - streak;
  return idx >= 0 ? fmtDay(series[idx].date) : fmtDay(series[0].date);
}

function bestDay(series: { date: string; value: number }[]) {
  let best = { gain: 0, date: "" };
  for (let i = 1; i < series.length; i++) {
    const gain = series[i].value - series[i - 1].value;
    if (gain > best.gain) best = { gain, date: series[i].date };
  }
  return best;
}

function peakDate(series: { date: string; value: number }[], peak: number): string {
  const row = [...series].reverse().find((s) => s.value === peak);
  return row ? fmtDay(row.date) : "";
}

export function MomentumStrip({
  series,
  totalMrrCents,
}: {
  series: { date: string; value: number }[];
  totalMrrCents: number;
}) {
  const values = series.map((s) => s.value);
  if (values.length < 2) return null;

  const streak = upStreak(values);
  const peak = Math.max(...values);
  const last = values[values.length - 1];
  const atPeak = last >= peak;
  const best = bestDay(series);
  const m = milestoneFor(totalMrrCents);
  const pDate = peakDate(series, peak);
  const sStart = streakStart(series, streak);

  const stats: { label: string; value: string; note: string; accent: string }[] = [
    {
      label: "Growth streak",
      value: streak > 0 ? `${streak}d` : "Flat",
      note: streak > 0 && sStart ? `since ${sStart}` : "no streak yet",
      accent: streak > 5 ? "#10b981" : streak > 0 ? "#f59e0b" : "#a0a0a0",
    },
    {
      label: atPeak ? "All-time high" : "Peak MRR",
      value: fmtMrr(peak),
      note: atPeak ? "you're there now" : pDate ? `hit on ${pDate}` : `${fmtMrr(peak - last)} below peak`,
      accent: atPeak ? "#10b981" : "#5e6ad2",
    },
    {
      label: "Best day",
      value: best.gain > 0 ? `+${fmtMrr(best.gain)}` : "—",
      note: best.date ? fmtDay(best.date) : "no new MRR yet",
      accent: best.gain > 0 ? "#5e6ad2" : "#a0a0a0",
    },
    {
      label: "Next milestone",
      value: fmtMrr(m.nextCents),
      note: `${fmtMrr(m.toGoCents)} away`,
      accent: "#5e6ad2",
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm sm:grid-cols-4" style={{ background: "#ebebeb" }}>
      {stats.map((s) => (
        <div key={s.label} className="relative bg-white px-5 py-4">
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: s.accent }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{s.label}</p>
          <p className="mt-2 text-[22px] font-bold leading-none tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
          <p className="mt-1.5 text-[11.5px] text-lx-muted">{s.note}</p>
        </div>
      ))}
    </div>
  );
}
