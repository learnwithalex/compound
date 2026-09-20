"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompoundMark } from "../compound-logo";

function dispatchBrief() {
  window.dispatchEvent(new Event("compound:brief"));
}

const NAV = [
  { href: "/app", label: "Overview" },
  { href: "/app/connect", label: "Connect" },
  { href: "/app/agents", label: "Agents" },
];

export function TopNav() {
  const pathname = usePathname();
  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }
  return (
    // Fade, not a bar: hides content scrolling through the gap above the island.
    <header
      className="sticky top-0 z-40 px-4 pb-4 pt-3"
      style={{ background: "linear-gradient(to bottom, #ffffff 55%, rgba(255,255,255,0))" }}
    >
      <div
        className="mx-auto flex h-[52px] max-w-[940px] items-center gap-6 rounded-sm pl-4 pr-3"
        style={{
          background: "rgba(250,250,250,0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid #ebebeb",
          boxShadow: "0 1px 2px rgba(20,20,20,0.03), 0 6px 18px rgba(20,20,20,0.04)",
        }}
      >
        <Link href="/app" className="flex shrink-0 items-center gap-2">
          <CompoundMark size={26} theme="light" />
          <span className="text-[14px] font-bold text-lx-text" style={{ letterSpacing: "-0.02em" }}>compound</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="rounded-sm px-2.5 py-1.5 text-[13px] font-medium transition-colors"
                style={{
                  color: active ? "#1a1a1a" : "#9a9a9a",
                  background: active ? "#ededed" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isActive("/app") && (
            <button
              onClick={dispatchBrief}
              className="flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ background: "rgba(94,106,210,0.1)", color: "#5e6ad2", border: "1px solid rgba(94,106,210,0.2)" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                <path d="M6 0l1.2 4.8L12 6l-4.8 1.2L6 12 4.8 7.2 0 6l4.8-1.2z" />
              </svg>
              Get briefing
            </button>
          )}
          <Link
            href="/app/connect"
            className="rounded-sm px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#5e6ad2" }}
          >
            + New product
          </Link>
          <Link href="/api/auth/signout" className="text-[13px] text-lx-faint transition-colors hover:text-lx-muted">
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}
