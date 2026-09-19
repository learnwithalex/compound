"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const NAV_MAIN = [
  { href: "/app",           label: "Overview",  icon: HomeIcon },
  { href: "/app/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/app/products",  label: "Products",  icon: ProductsIcon },
  { href: "/app/connect",   label: "Connect",   icon: LinkIcon },
];

const NAV_MORE = [
  { href: "/app/agents", label: "Agents", icon: AgentIcon, badge: "Beta" },
];

const NAV_BOTTOM = [
  { href: "/app/settings", label: "Settings", icon: SettingsIcon },
  { href: "/app/billing",  label: "Billing",  icon: BillingIcon },
  { href: "/app/help",     label: "Help",     icon: HelpIcon },
  { href: "/app/feedback", label: "Feedback", icon: FeedbackIcon },
];

const PRODUCT_TABS = [
  { tab: "overview",  label: "Overview",  icon: HomeIcon },
  { tab: "customers", label: "Customers", icon: CustomersIcon },
  { tab: "cohorts",   label: "Cohorts",   icon: CohortsIcon },
  { tab: "segments",  label: "Segments",  icon: SegmentsIcon },
  { tab: "tracking",  label: "Tracking",  icon: TrackingIcon },
  { tab: "settings",  label: "Settings",  icon: SettingsIcon },
];

function NavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect product context: /app/products/<id>
  const productMatch = pathname.match(/^\/app\/products\/([^/]+)/);
  const productId = productMatch?.[1] ?? null;
  const productName = searchParams.get("name") ?? "Product";
  const activeTab = searchParams.get("tab") ?? "overview";

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  if (productId) {
    return (
      <nav className="flex-1 overflow-y-auto py-3 pl-3 pr-3 md:pl-16 lg:pl-40">
        <p className="mb-1 pl-3 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#b8b8b8] truncate">
          {productName}
        </p>

        {PRODUCT_TABS.map(({ tab, label, icon: Icon }) => {
          const href = tab === "overview"
            ? `/app/products/${productId}?name=${encodeURIComponent(productName)}`
            : `/app/products/${productId}?tab=${tab}&name=${encodeURIComponent(productName)}`;
          const active = activeTab === tab;
          return (
            <Item key={tab} href={href} label={label} Icon={Icon} active={active} />
          );
        })}
      </nav>
    );
  }

  return (
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
  );
}

export function SidebarNav() {
  return (
    <aside
      className="flex w-[200px] shrink-0 flex-col bg-white md:w-[280px] lg:w-[380px]"
      style={{ borderRight: "1px solid #ebebeb" }}
    >
      <Suspense fallback={<div className="flex-1" />}>
        <NavContent />
      </Suspense>

      <div className="pb-3 pl-3 pr-3 pt-2 md:pl-16 lg:pl-40" style={{ borderTop: "1px solid #ebebeb" }}>
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => (
          <Item key={label} href={href} label={label} Icon={Icon} active={false} />
        ))}
        <button
          onClick={() => { window.location.href = "/api/auth/signout"; }}
          className="mb-px flex h-[34px] w-full items-center gap-[9px] rounded-sm pl-3 pr-2 text-[13px] text-[#565656] transition-colors hover:bg-[#f3f4f6] hover:text-[#111111]"
        >
          <span className="shrink-0 text-[#a0a0a0]"><SignOutIcon /></span>
          <span className="flex-1 leading-none text-left">Sign out</span>
        </button>
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
function BillingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="4" width="13" height="9" rx="1.5" />
      <path d="M1.5 7h13" />
      <path d="M5 11h2" />
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
function CustomersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}
function CohortsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="0.5" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="0.5" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="0.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
    </svg>
  );
}
function SegmentsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2v6l4 4" />
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="0.75" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="0.75" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="0.75" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="0.75" />
    </svg>
  );
}
function TrackingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,6 2,8 4,10" />
      <polyline points="12,6 14,8 12,10" />
      <line x1="9" y1="4" x2="7" y2="12" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M6.2 6a2 2 0 0 1 3.8.8c0 1.2-1.5 1.8-1.5 2.7" />
      <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FeedbackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v7A1.5 1.5 0 0 1 12.5 12H5l-3 2.5V3.5z" />
    </svg>
  );
}
