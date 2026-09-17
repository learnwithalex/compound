"use client";
import { useEffect, useState } from "react";
import { fmtMrr } from "@/lib/format";

const MILESTONES = [100_00, 500_00, 1_000_00, 5_000_00, 10_000_00, 25_000_00, 50_000_00, 100_000_00, 250_000_00, 500_000_00, 1_000_000_00];

function nextMilestone(cents: number) {
  return MILESTONES.find((m) => m > cents) ?? null;
}

function crossedMilestone(current: number, last: number) {
  return MILESTONES.find((m) => m <= current && m > last) ?? null;
}

export function MilestoneBanner({ totalMrrCents }: { totalMrrCents: number }) {
  const [lastMilestone, setLastMilestone] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((s: { lastMilestoneCents: number; milestoneAlerts: boolean }) => {
      if (!s.milestoneAlerts) return;
      const crossed = crossedMilestone(totalMrrCents, s.lastMilestoneCents);
      if (crossed) {
        setLastMilestone(crossed);
        fetch("/api/settings", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lastMilestoneCents: totalMrrCents }),
        });
      }
    });
  }, [totalMrrCents]);

  if (!lastMilestone || dismissed) return null;

  return (
    <div
      className="mb-4 flex items-center gap-4 rounded-sm px-5 py-4"
      style={{ background: "linear-gradient(135deg, #f0f0ff 0%, #e8f5ee 100%)", border: "1px solid #c7d7f7" }}
    >
      <span className="text-[28px] leading-none">🎉</span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-lx-text">You crossed {fmtMrr(lastMilestone)} MRR!</p>
        <p className="mt-0.5 text-[12px] text-lx-muted">
          {nextMilestone(totalMrrCents)
            ? `Next milestone: ${fmtMrr(nextMilestone(totalMrrCents)!)} — ${fmtMrr(nextMilestone(totalMrrCents)! - totalMrrCents)} to go.`
            : "You're crushing it. Keep going."}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-[18px] text-lx-faint hover:text-lx-muted"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
