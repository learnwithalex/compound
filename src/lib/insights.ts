import type { ProductMetrics } from "./metrics";

/* ============================================================ churn radar */

export interface RadarSignal {
  connectionId: string;
  label: string;
  color: string;
  severity: "red" | "amber";
  message: string;
}

function downStreak(history: { mrrCents: number }[]): number {
  let streak = 0;
  for (let i = history.length - 1; i > 0; i--) {
    if (history[i].mrrCents < history[i - 1].mrrCents) streak++;
    else break;
  }
  return streak;
}

export function radarSignals(products: ProductMetrics[]): RadarSignal[] {
  const signals: RadarSignal[] = [];
  for (const p of products) {
    const per: RadarSignal[] = [];
    const streak = downStreak(p.history);
    if (streak >= 3) {
      per.push({ connectionId: p.connectionId, label: p.label, color: p.color, severity: "red", message: `Down ${streak} days straight` });
    } else if (streak === 2) {
      per.push({ connectionId: p.connectionId, label: p.label, color: p.color, severity: "amber", message: "Down 2 days in a row" });
    }
    const growth = p.newMrrCents + p.expansionMrrCents;
    if (p.churnedMrrCents > 0 && p.churnedMrrCents > growth) {
      per.push({ connectionId: p.connectionId, label: p.label, color: p.color, severity: "red", message: "Churn outpacing growth" });
    }
    if (p.mrrChange30d <= -5) {
      per.push({ connectionId: p.connectionId, label: p.label, color: p.color, severity: "red", message: `Down ${Math.abs(p.mrrChange30d).toFixed(1)}% in 30d` });
    } else if (p.mrrChange30d < 0 && per.length === 0 && p.churnedMrrCents > 0) {
      per.push({ connectionId: p.connectionId, label: p.label, color: p.color, severity: "amber", message: `Drifting down ${Math.abs(p.mrrChange30d).toFixed(1)}% in 30d` });
    }
    // Red first, max 2 per product to avoid noise
    per.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "red" ? -1 : 1));
    signals.push(...per.slice(0, 2));
  }
  return signals;
}

/* ============================================================ milestones */

const LADDER = [
  10000, 50000, 100000, 250000, 500000, 1000000,
  2500000, 5000000, 10000000, 25000000, 50000000, 100000000,
]; // cents: $100 … $1M MRR

export interface Milestone {
  prevCents: number;
  nextCents: number;
  pct: number; // 0-100 progress from prev to next
  toGoCents: number;
  crossed: number;
}

export function milestoneFor(mrrCents: number): Milestone {
  const nextCents = LADDER.find((m) => m > mrrCents) ?? LADDER[LADDER.length - 1] * 2;
  const idx = LADDER.indexOf(nextCents);
  const prevCents = idx > 0 ? LADDER[idx - 1] : 0;
  const crossed = LADDER.filter((m) => m <= mrrCents).length;
  const span = nextCents - prevCents || 1;
  return {
    prevCents,
    nextCents,
    pct: Math.min(100, Math.max(0, ((mrrCents - prevCents) / span) * 100)),
    toGoCents: Math.max(0, nextCents - mrrCents),
    crossed,
  };
}
