"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CompoundMark } from "../compound-logo";

type Segment = { label: string; href?: string };

function resolveSegments(pathname: string, params: URLSearchParams): Segment[] {
  if (/^\/app\/products\/[^/]+/.test(pathname)) {
    const name = params.get("name") || "Product";
    return [
      { label: "Overview", href: "/app" },
      { label: name },
    ];
  }

  if (/^\/app\/customers\/[^/]+/.test(pathname)) {
    const name = params.get("name") || "Customer";
    const pname = params.get("pname") || "Product";
    const connection = params.get("connection") || "";
    return [
      { label: "Overview", href: "/app" },
      {
        label: pname,
        href: connection
          ? `/app/products/${connection}?name=${encodeURIComponent(pname)}`
          : "/app",
      },
      { label: name },
    ];
  }

  if (pathname.startsWith("/app/analytics")) return [{ label: "Analytics" }];
  if (pathname.startsWith("/app/connect")) return [{ label: "Connect" }];
  if (pathname.startsWith("/app/agents")) return [{ label: "Agents" }];
  if (pathname.startsWith("/app/settings")) return [{ label: "Settings" }];
  if (pathname === "/app") return [{ label: "Overview" }];

  return [];
}

export function MiniHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = resolveSegments(pathname, searchParams);
  const isOverview = pathname === "/app";
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.ok ? r.json() : { isPro: false })
      .then((d) => setIsPro(d.isPro))
      .catch(() => setIsPro(false));
  }, []);

  function triggerBriefing() {
    window.dispatchEvent(new CustomEvent("compound:brief"));
  }

  return (
    <header
      className="flex h-[56px] shrink-0 items-center gap-2 px-4 md:px-16 lg:px-40"
      style={{ borderBottom: "1px solid #ebebeb" }}
    >
      {/* Workspace identity */}
      <Link href="/app" className="flex shrink-0 items-center gap-2">
        <CompoundMark size={20} theme="light" />
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-medium text-lx-text">compound</span>
          {isPro !== null && (
            <span
              className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: isPro ? "#5e6ad2" : "#f59e0b" }}
            >
              {isPro ? "Pro" : "Free Trial"}
            </span>
          )}
        </div>
      </Link>

      {/* Breadcrumb */}
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-[13px] text-[#d0d0d0]">/</span>
          {seg.href ? (
            <Link href={seg.href} className="text-[13px] text-lx-faint hover:text-lx-text">
              {seg.label}
            </Link>
          ) : (
            <span className="text-[13px] text-lx-faint">{seg.label}</span>
          )}
        </span>
      ))}

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {isOverview && (
          <button
            onClick={triggerBriefing}
            className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-semibold text-lx-muted transition-colors hover:bg-[#f5f5f5] hover:text-lx-text"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 0l1.2 4.8L12 6l-4.8 1.2L6 12 4.8 7.2 0 6l4.8-1.2z" />
            </svg>
            AI briefing
          </button>
        )}

        {/* Split button: + New product | ▾ */}
        <div className="flex overflow-hidden rounded-sm" style={{ border: "1px solid #4f5bbf" }}>
          <Link
            href="/app/connect"
            className="px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#5e6ad2" }}
          >
            + New product
          </Link>
          <div className="w-px" style={{ background: "rgba(255,255,255,0.25)" }} />
          <button
            className="flex items-center px-2 py-1.5 text-white transition-opacity hover:opacity-90"
            style={{ background: "#5e6ad2" }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,4 6,8 10,4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
