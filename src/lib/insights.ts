import type { ProductMetrics } from "./metrics";

/* ============================================================ churn radar */

export type Severity = "red" | "amber";

export interface RadarReason {
  severity: Severity;
  message: string;
}

/** One entry per struggling product rather than per reason: a product with
 *  three problems is still one thing to go and fix. */
export interface RadarSignal {
  connectionId: string;
  label: string;
  color: string;
  provider: string;
  severity: Severity;
  /** Churned MRR over the last 30 days — what triage should be ordered by. */
  atRiskCents: number;
  /** Churn minus new + expansion; positive means the product is net shrinking. */
  netCents: number;
  reasons: RadarReason[];
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
    const reasons: RadarReason[] = [];
    const streak = downStreak(p.history);
    if (streak >= 3) reasons.push({ severity: "red", message: `Down ${streak} days straight` });
    else if (streak === 2) reasons.push({ severity: "amber", message: "Down 2 days in a row" });

    const growth = p.newMrrCents + p.expansionMrrCents;
    if (p.churnedMrrCents > 0 && p.churnedMrrCents > growth) {
      reasons.push({ severity: "red", message: "Churn outpacing growth" });
    }

    if (p.mrrChange30d <= -5) {
      reasons.push({ severity: "red", message: `Down ${Math.abs(p.mrrChange30d).toFixed(1)}% in 30d` });
    } else if (p.mrrChange30d < 0 && reasons.length === 0 && p.churnedMrrCents > 0) {
      reasons.push({ severity: "amber", message: `Drifting down ${Math.abs(p.mrrChange30d).toFixed(1)}% in 30d` });
    }

    if (reasons.length === 0) continue;

    reasons.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "red" ? -1 : 1));
    signals.push({
      connectionId: p.connectionId,
      label: p.label,
      color: p.color,
      provider: p.provider,
      severity: reasons.some((r) => r.severity === "red") ? "red" : "amber",
      atRiskCents: p.churnedMrrCents,
      netCents: p.churnedMrrCents - growth,
      reasons,
    });
  }

  // Worst first: red before amber, then by the money actually at stake.
  return signals.sort((a, b) =>
    a.severity !== b.severity ? (a.severity === "red" ? -1 : 1) : b.atRiskCents - a.atRiskCents,
  );
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
