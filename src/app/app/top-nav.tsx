"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompoundMark } from "../compound-logo";

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
    <header className="sticky top-0 z-40" style={{ background: "rgba(243,241,236,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #ddd9d0" }}>
      <div className="mx-auto flex h-[60px] max-w-[1080px] items-center gap-8 px-6">
        <Link href="/app" className="flex shrink-0 items-center gap-2.5">
          <CompoundMark size={30} theme="light" />
          <span className="text-[15px] font-bold text-lx-text" style={{ letterSpacing: "-0.02em" }}>compound</span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative py-1 text-[13px] font-medium transition-colors"
                style={{ color: active ? "#1a1a1a" : "#9c9894" }}
              >
                {label}
                {active && (
                  <span
                    className="absolute inset-x-0 -bottom-[3px] h-[2px] rounded-full"
                    style={{ background: "#5e6ad2" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <Link
            href="/app/connect"
            className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#5e6ad2" }}
          >
            + New product
          </Link>
          <Link href="/login" className="text-[13px] text-lx-faint transition-colors hover:text-lx-muted">
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}
