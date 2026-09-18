"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TABS = [
  { tab: "overview",   label: "Overview",   icon: OverviewIcon },
  { tab: "customers",  label: "Customers",  icon: CustomersIcon },
  { tab: "cohorts",    label: "Cohorts",    icon: CohortsIcon },
  { tab: "segments",   label: "Segments",   icon: SegmentsIcon },
  { tab: "tracking",   label: "Tracking",   icon: TrackingIcon },
];

function NavContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") ?? "overview";

  return (
    <nav className="space-y-0.5">
      {TABS.map(({ tab, label, icon: Icon }) => {
        const isActive = active === tab;
        const href = tab === "overview"
          ? `/app/products/${id}`
          : `/app/products/${id}?tab=${tab}`;
        return (
          <Link
            key={tab}
            href={href}
            className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] transition-colors ${
              isActive
                ? "bg-[#f3f4f6] font-semibold text-[#111]"
                : "font-medium text-[#565656] hover:bg-[#f7f7f7] hover:text-[#111]"
            }`}
          >
            <span className={isActive ? "text-[#111]" : "text-[#a0a0a0]"}>
              <Icon />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ProductSidebar({ id, productName }: { id: string; productName: string }) {
  return (
    <aside className="w-[168px] shrink-0 pt-1" style={{ borderRight: "1px solid #ebebeb" }}>
      <div className="mb-3 px-3">
        <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#b8b8b8]">
          {productName}
        </p>
      </div>
      <Suspense>
        <NavContent id={id} />
      </Suspense>
    </aside>
  );
}

/* ------------------------------------------------------------------ icons */

function OverviewIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l6-5 6 5v7.5H10.5v-4H5.5v4H2V7z" />
    </svg>
  );
}
function CustomersIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}
function CohortsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="0.5" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="0.5" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="0.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
    </svg>
  );
}
function SegmentsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2v6l4 4" />
    </svg>
  );
}
function TrackingIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,6 2,8 4,10" />
      <polyline points="12,6 14,8 12,10" />
      <line x1="9" y1="4" x2="7" y2="12" />
    </svg>
  );
}
