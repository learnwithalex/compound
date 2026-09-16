"use client";
import { useEffect, useRef, useState } from "react";
import type { PortfolioMetrics } from "@/lib/metrics";
import type { Brief } from "@/lib/brief";
import { BriefLoading } from "./brief-loading";
import { BriefView } from "./brief-view";

type View = "dashboard" | "loading" | "brief";

export function DashboardShell({
  metrics,
  series,
  hello,
  name,
  subtitle,
  children,
}: {
  metrics: PortfolioMetrics;
  series: { date: string; value: number }[];
  hello: string;
  name: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<View>("dashboard");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = () => run();
    window.addEventListener("compound:brief", handler);
    return () => window.removeEventListener("compound:brief", handler);
  }, []);

  function toTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function run() {
    // A cached brief is a click away again; only pay for a new one on request.
    setError(null);
    setView("loading");
    toTop();

    const controller = new AbortController();
    abort.current = controller;

    try {
      const res = await fetch("/api/analyze", { method: "POST", signal: controller.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setBrief(data.brief);
      setView("brief");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setView("dashboard");
    } finally {
      toTop();
    }
  }

  function cancel() {
    abort.current?.abort();
    setView("dashboard");
    toTop();
  }

  if (view === "loading") return <BriefLoading onCancel={cancel} />;

  if (view === "brief" && brief) {
    return <BriefView brief={brief} metrics={metrics} series={series} onBack={() => { setView("dashboard"); toTop(); }} />;
  }

  return (
    <>
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-[26px] font-semibold tracking-tight text-lx-text" style={{ letterSpacing: "-0.022em" }}>
          {hello}, {name}.
        </h1>
        <p className="mt-1 text-[14px] text-lx-muted">{subtitle}</p>
        {error && <p className="mt-1 text-[11px] font-medium" style={{ color: "#c8392c" }}>{error}</p>}
        {brief && (
          <button
            onClick={() => { setView("brief"); toTop(); }}
            className="mt-2 text-[12px] font-medium text-lx-purple hover:opacity-80"
          >
            View last brief →
          </button>
        )}
      </div>

      {children}
    </>
  );
}
