import { fmtMrr } from "@/lib/format";
import { milestoneFor } from "@/lib/insights";

const fmtDay = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Consecutive days at the end of the series that didn't go down. */
function upStreak(values: number[]): number {
  let n = 0;
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i] >= values[i - 1]) n++;
    else break;
  }
  return n;
}

function bestDay(series: { date: string; value: number }[]) {
  let best = { gain: 0, date: "" };
  for (let i = 1; i < series.length; i++) {
    const gain = series[i].value - series[i - 1].value;
    if (gain > best.gain) best = { gain, date: series[i].date };
  }
  return best;
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

  const stats = [
    {
      label: "Growth streak",
      value: streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "Broken",
      note: streak > 0 ? "without a dip" : "last day was down",
    },
    {
      label: atPeak ? "All-time high" : "Peak MRR",
      value: fmtMrr(peak),
      note: atPeak ? "at the top right now" : `${fmtMrr(peak - last)} off the peak`,
    },
    {
      label: "Best day",
      value: best.gain > 0 ? `+${fmtMrr(best.gain)}` : "—",
      note: best.date ? fmtDay(best.date) : "no gain yet in range",
    },
    {
      label: "Next milestone",
      value: fmtMrr(m.toGoCents),
      note: `to go until ${fmtMrr(m.nextCents)}`,
    },
  ];

  // gap-px over a tinted parent draws the dividers, so they stay correct when
  // the grid reflows from four columns to two.
  return (
    <div
      className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm sm:grid-cols-4"
      style={{ background: "#ebebeb" }}
    >
      {stats.map((s) => (
        <div key={s.label} className="bg-white px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{s.label}</p>
          <p className="mt-2 text-[19px] font-semibold leading-none tabular-nums text-lx-text">{s.value}</p>
          <p className="mt-1.5 text-[11.5px] text-lx-faint">{s.note}</p>
        </div>
      ))}
    </div>
  );
}
