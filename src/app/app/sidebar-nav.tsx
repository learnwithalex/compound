"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompoundMark } from "../compound-logo";

const NAV = [
  { href: "/app",           label: "Overview",  icon: HomeIcon },
  { href: "/app/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/app/connect",   label: "Connect",   icon: LinkIcon },
  { href: "/app/agents",    label: "Agents",    icon: AgentIcon },
];

function ChartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="7" /><rect x="12.5" y="7" width="3" height="11" /><rect x="18" y="4" width="3" height="14" />
    </svg>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }
  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-lx-sidebar" style={{ borderRight: "1px solid #ddd9d0" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <CompoundMark size={34} theme="light" />
        <div>
          <div className="text-[15px] font-bold leading-none text-lx-text" style={{ letterSpacing: "-0.02em" }}>compound</div>
          <div className="mt-1 text-[11px] leading-none text-lx-faint">Revenue OS</div>
        </div>
      </div>
      <div className="mx-5 mb-2" style={{ height: 1, background: "#ddd9d0" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-[40px] items-center gap-3 rounded-[8px] px-3.5 text-[14px] font-medium transition-colors ${
                active
                  ? "bg-white text-lx-text shadow-sm"
                  : "text-lx-muted hover:bg-white/70 hover:text-lx-text"
              }`}
              style={active ? { border: "1px solid #ddd9d0" } : {}}
            >
              <span className={active ? "text-lx-purple" : "text-lx-faint"}><Icon /></span>
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid #ddd9d0" }}>
        <Link href="/login" className="flex h-[38px] items-center gap-3 rounded-[8px] px-3.5 text-[13px] text-lx-faint transition-colors hover:bg-white/70 hover:text-lx-muted">
          <SignOutIcon /><span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
}

function HomeIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 6.5L7 2l5.5 4.5V13H9V9H5v4H1.5V6.5z"/></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 5.5L9.5 4.5a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0"/><path d="M5.5 8.5L4.5 9.5a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0"/><line x1="5.5" y1="8.5" x2="8.5" y2="5.5"/></svg>;
}
function AgentIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2.5" width="10" height="7" rx="1.5"/><circle cx="5" cy="6" r="0.75" fill="currentColor" stroke="none"/><circle cx="9" cy="6" r="0.75" fill="currentColor" stroke="none"/><path d="M4.5 11.5h5"/></svg>;
}
function SignOutIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3"/><path d="M9 9.5l3-3-3-3"/><line x1="12" y1="6.5" x2="5" y2="6.5"/></svg>;
}
