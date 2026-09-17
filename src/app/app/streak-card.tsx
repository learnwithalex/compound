"use client";
import { useState } from "react";

const MILESTONES = [7, 30, 60, 100, 200, 365];

function nextMilestone(streak: number) {
  return MILESTONES.find((m) => m > streak) ?? 365;
}

export function StreakCard({ streakDays }: { streakDays: number }) {
  const [open, setOpen] = useState(true);

  const next = nextMilestone(streakDays);
  const toGo = next - streakDays;
  const visibleStreak = Math.min(streakDays, 14);
  // dots: left = 13 days ago, right = today; fill the rightmost `visibleStreak` dots
  const dots = Array.from({ length: 14 }, (_, i) => i >= 14 - visibleStreak);

  const flame = streakDays >= 30 ? "🔥" : streakDays >= 7 ? "🔥" : streakDays > 0 ? "🔥" : "💤";

  return (
    <div className="mb-6 rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-5 py-2.5 transition-colors hover:bg-[#fafafa]"
        style={{ borderBottom: open ? "1px solid #ebebeb" : "none" }}
      >
        <svg
          width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
        <span className="text-[12px] font-semibold text-lx-muted">Your streak</span>
      </button>

      {open && (
        <div className="flex items-center gap-4 px-5 py-4">
          <span className="text-[22px] leading-none">{flame}</span>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-lx-text">
              {streakDays}-day streak
            </p>
            <p className="text-[12px] text-lx-muted">
              {toGo === 0
                ? `You hit the ${next}-day milestone! 🎉`
                : `${toGo} day${toGo === 1 ? "" : "s"} to your ${next}-day milestone`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-[3px]">
              {dots.map((active, i) => (
                <div
                  key={i}
                  className="h-[13px] w-[13px] rounded-sm"
                  style={{ background: active ? "#5e6ad2" : "#efefef" }}
                />
              ))}
            </div>
            <span className="text-[12px] font-medium text-lx-faint">
              {streakDays > 0 ? `${streakDays} day${streakDays === 1 ? "" : "s"} and counting` : "Visit daily to build your streak"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
