"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_MAIN = [
  { href: "/app",           label: "Overview",  icon: HomeIcon },
  { href: "/app/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/app/connect",   label: "Connect",   icon: LinkIcon },
];

const NAV_MORE = [
  { href: "/app/agents", label: "Agents", icon: AgentIcon, badge: "Beta" },
];

const NAV_BOTTOM = [
  { href: "/app/connect", label: "Settings",  icon: SettingsIcon },
  { href: "/login",       label: "What's new", icon: WhatsNewIcon },
  { href: "/login",       label: "Sign out",   icon: SignOutIcon },
];

export function SidebarNav() {
  const pathname = usePathname();
  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex w-[200px] shrink-0 flex-col bg-white md:w-[280px] lg:w-[380px]"
      style={{ borderRight: "1px solid #ebebeb" }}
    >
      <nav className="flex-1 overflow-y-auto py-3 pl-3 pr-3 md:pl-16 lg:pl-40">
        {NAV_MAIN.map(({ href, label, icon: Icon }) => (
          <Item key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
        ))}

        <p className="mb-1 mt-5 pl-3 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#b8b8b8]">
          More
        </p>

        {NAV_MORE.map(({ href, label, icon: Icon, badge }) => (
          <Item key={href} href={href} label={label} Icon={Icon} active={isActive(href)} badge={badge} />
        ))}
      </nav>

      <div className="pb-3 pl-3 pr-3 pt-2 md:pl-16 lg:pl-40" style={{ borderTop: "1px solid #ebebeb" }}>
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => (
          <Item key={label} href={href} label={label} Icon={Icon} active={false} />
        ))}
      </div>
    </aside>
  );
}

function Item({
  href,
  label,
  Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  Icon: () => React.ReactElement;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`mb-px flex h-[34px] items-center gap-[9px] rounded-sm pl-3 pr-2 text-[13px] transition-colors ${
        active
          ? "bg-[#f3f4f6] text-[#111111]"
          : "text-[#565656] hover:bg-[#f3f4f6] hover:text-[#111111]"
      }`}
    >
      <span className="shrink-0 text-[#a0a0a0]">
        <Icon />
      </span>
      <span className="flex-1 leading-none">{label}</span>
      {badge && (
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ background: "#eff0fb", color: "#5e6ad2" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ icons */

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l6-5 6 5v7.5H10.5v-4H5.5v4H2V7z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,12 5,7 9,9 15,3" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9.5a3.5 3.5 0 0 0 4.95 0l2-2a3.5 3.5 0 0 0-4.95-4.95l-1 1" />
      <path d="M9.5 6.5a3.5 3.5 0 0 0-4.95 0l-2 2a3.5 3.5 0 0 0 4.95 4.95l1-1" />
    </svg>
  );
}
function AgentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="8" rx="2" />
      <circle cx="6" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <path d="M5.5 13.5h5" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.05 1.05M11.85 11.85l1.05 1.05M12.9 3.1l-1.05 1.05M4.15 11.85l-1.05 1.05" />
    </svg>
  );
}
function WhatsNewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" />
      <line x1="5" y1="8" x2="11" y2="8" />
      <line x1="5" y1="10.5" x2="8.5" y2="10.5" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" />
      <path d="M11 11l3-3-3-3" />
      <path d="M14 8H7" />
    </svg>
  );
}
