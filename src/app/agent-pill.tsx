"use client";
import { useState } from "react";

// Quiet agent-onboarding link for the hero — text + mini icons, no button
// chrome, so it never competes with the primary CTA. Opens the same modal.
export function AgentPillLink() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const skill = `Ask Compound about my revenue.
1. Create a free account at ${typeof window !== "undefined" ? window.location.origin : "<app-url>"}
2. Go to Agents → create a token
3. GET /api/portfolio with header: Authorization: Bearer <token>
4. Brief me: what's working, what's at risk, one action.`;

  function copy() {
    navigator.clipboard.writeText(skill);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 text-[13px] text-[#5c5856] transition-colors hover:text-[#1a1a1a]"
      >
        <span className="flex items-center gap-1">
          <img src="https://cdn.simpleicons.org/claude/d97757" alt="Claude" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} loading="eager" />
          <img src="https://cdn.simpleicons.org/cursor/000000" alt="Cursor" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} loading="eager" />
          <img src="https://cdn.simpleicons.org/googlegemini/1c7dff" alt="Gemini" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} loading="eager" />
        </span>
        <span className="underline decoration-[#c8c4bc] decoration-dotted underline-offset-4 group-hover:decoration-[#1a1a1a]">
          Prefer AI? Onboard your agent to Compound
        </span>
        <span className="text-[#ff5c00] transition-transform group-hover:translate-x-0.5">→</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-md rounded-xl border-2 border-[#1a1a1a] bg-white p-6 shadow-[5px_5px_0_#1a1a1a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 text-[16px] font-bold text-[#1a1a1a]">Give your agent revenue superpowers</div>
            <p className="mb-4 text-[13px] leading-5 text-[#5c5856]">
              Paste this into Claude, Cursor, or any agent. It creates an account,
              connects revenue, and briefs you — hands-free.
            </p>
            <pre className="mb-4 max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#e7e3db] bg-[#f8f7f4] p-4 font-mono text-[12px] leading-5 text-[#1a1a1a]">
              {skill}
            </pre>
            <div className="flex gap-3">
              <button
                onClick={copy}
                className="flex h-10 flex-1 items-center justify-center rounded-lg border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[13px] font-semibold text-white shadow-[3px_3px_0_#1a1a1a] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {copied ? "Copied ✓" : "Copy skill prompt"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 items-center rounded-lg border-2 border-[#1a1a1a] bg-white px-4 text-[13px] font-semibold text-[#1a1a1a]"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#9c9894]">
              No OAuth · read-only · revoke anytime from /app/agents
            </p>
          </div>
        </div>
      )}
    </>
  );
}
