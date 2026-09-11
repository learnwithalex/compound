"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/app",         label: "Overview",  icon: HomeIcon },
  { href: "/app/connect", label: "Connect",   icon: LinkIcon },
];

export function SidebarNav() {
  const pathname = usePathname();
  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }
  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col" style={{ background: "#14141a", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2.5 px-3 py-[11px]">
        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md" style={{ background: "#5e6ad2" }}>
          <CompoundIcon />
        </div>
        <div>
          <div className="text-[13px] font-semibold leading-none text-lx-text">Compound</div>
          <div className="mt-0.5 text-[11px] leading-none text-lx-faint">Revenue OS</div>
        </div>
      </div>
      <div className="mx-3 mb-1" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
      <nav className="flex-1 px-2 py-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`flex h-[28px] items-center gap-2 rounded-[4px] px-2 text-[13px] transition-colors ${active ? "bg-[rgba(94,106,210,0.12)] text-lx-text" : "text-lx-muted hover:bg-[rgba(255,255,255,0.05)] hover:text-lx-text"}`}>
              <span className={`shrink-0 ${active ? "text-lx-purple" : "text-lx-faint"}`}><Icon /></span>
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/login" className="flex h-[28px] items-center gap-2 rounded-[4px] px-2 text-[12px] text-lx-faint transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-lx-muted">
          <SignOutIcon /><span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
}

function CompoundIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10V7a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="7" r="2" fill="white"/></svg>;
}
function HomeIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 6.5L7 2l5.5 4.5V13H9V9H5v4H1.5V6.5z"/></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 5.5L9.5 4.5a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0"/><path d="M5.5 8.5L4.5 9.5a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0"/><line x1="5.5" y1="8.5" x2="8.5" y2="5.5"/></svg>;
}
function SignOutIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3"/><path d="M9 9.5l3-3-3-3"/><line x1="12" y1="6.5" x2="5" y2="6.5"/></svg>;
}
