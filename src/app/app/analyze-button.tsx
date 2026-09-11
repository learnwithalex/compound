"use client";
import { useState } from "react";

export function AnalyzeButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [analysis, setAnalysis] = useState<string | null>(null);

  async function run() {
    setState("loading");
    const res = await fetch("/api/analyze", { method: "POST" });
    const data = await res.json();
    setAnalysis(data.analysis ?? null);
    setState("done");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={run}
        disabled={state === "loading"}
        className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-50"
        style={{ background: "#5e6ad2" }}
      >
        {state === "loading" ? (
          <><span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" /> Analysing…</>
        ) : (
          <><SparkleIcon /> AI briefing</>
        )}
      </button>
      {analysis && (
        <div className="max-w-sm rounded-md p-3 text-[12px] leading-relaxed text-lx-muted" style={{ border: "1px solid #2a2a32", background: "#1c1c22" }}>
          {analysis}
        </div>
      )}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 0l1.2 4.8L12 6l-4.8 1.2L6 12 4.8 7.2 0 6l4.8-1.2z" />
    </svg>
  );
}
