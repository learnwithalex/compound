"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  orgName: string;
  pendingCount: number;
}

const NAV = [
  { href: "/app",              label: "Overview",     icon: HomeIcon },
  { href: "/app/transactions", label: "Transactions", icon: InboxIcon },
  { href: "/app/statements",   label: "Statements",   icon: FileTextIcon },
  { href: "/app/connect",      label: "Connect",      icon: LinkIcon },
];

export function SidebarNav({ orgName, pendingCount }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  const initial = orgName.slice(0, 1).toUpperCase();

  return (
    <aside
      className="flex h-screen w-[220px] shrink-0 flex-col"
      style={{ background: "#14141a", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Logo + workspace */}
      <div className="flex items-center gap-2.5 px-3 py-[11px]">
        <div
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md"
          style={{ background: "#5e6ad2" }}
        >
          <BookmarkIcon />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-none text-lx-text">Booked</div>
          <div className="mt-0.5 truncate text-[11px] leading-none text-lx-faint">{orgName}</div>
        </div>
      </div>

      <div className="mx-3 mb-1" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-[28px] items-center gap-2 rounded-[4px] px-2 text-[13px] transition-colors ${
                active
                  ? "bg-[rgba(94,106,210,0.12)] text-lx-text"
                  : "text-lx-muted hover:bg-[rgba(255,255,255,0.05)] hover:text-lx-text"
              }`}
            >
              <span className={`shrink-0 ${active ? "text-lx-purple" : "text-lx-faint"}`}>
                <Icon />
              </span>
              <span className="flex-1 leading-none">{label}</span>
              {label === "Transactions" && pendingCount > 0 && (
                <span
                  className="rounded-full px-[5px] py-[2px] text-[10px] font-semibold tabular-nums leading-none"
                  style={{ background: "rgba(94,106,210,0.18)", color: "#7b87e0" }}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User row */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
          style={{ background: "#252535", color: "#8a8a99" }}
        >
          {initial}
        </div>
        <span className="flex-1 truncate text-[12px] text-lx-faint">{orgName}</span>
        <Link
          href="/login"
          className="shrink-0 text-[11px] text-lx-faint transition-colors hover:text-lx-muted"
        >
          Sign out
        </Link>
      </div>
    </aside>
  );
}

function BookmarkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h9v10L6.5 9.5 2 12V2z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6.5L7 2l5.5 4.5V13H9V9H5v4H1.5V6.5z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 8.5h3L5.5 11h3l1-2.5h3" />
      <rect x="1.5" y="2" width="11" height="9.5" rx="1.5" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6.5L8 1.5z" />
      <path d="M8 1.5V6.5H12" />
      <line x1="4.5" y1="8" x2="9.5" y2="8" />
      <line x1="4.5" y1="10" x2="7.5" y2="10" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 5.5L9.5 4.5a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
      <path d="M5.5 8.5L4.5 9.5a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
      <line x1="5.5" y1="8.5" x2="8.5" y2="5.5" />
    </svg>
  );
}
