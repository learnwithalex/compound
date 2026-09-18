"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Avatar } from "@/app/app/avatar";
import { planTint, CountryMark } from "@/app/app/segment-icons";
import { fmtMrr } from "@/lib/format";
import type { TopCustomer } from "@/lib/analytics";

type SortKey = "mrr" | "mrr_asc" | "tenure" | "billed" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "mrr", label: "MRR (high → low)" },
  { value: "mrr_asc", label: "MRR (low → high)" },
  { value: "billed", label: "Total billed" },
  { value: "tenure", label: "Tenure" },
  { value: "name", label: "Name (A–Z)" },
];

function Pill({ label, tint }: { label: string; tint: string }) {
  return (
    <span className="inline-flex items-center rounded-sm px-2 py-[3px] text-[11px] font-semibold" style={{ color: tint, background: `${tint}14`, border: `1px solid ${tint}2e` }}>
      {label}
    </span>
  );
}

export function AllCustomersTable({
  customers,
  connectionId,
  productLabel,
}: {
  customers: TopCustomer[];
  connectionId: string;
  productLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("mrr");
  const [planFilter, setPlanFilter] = useState("all");

  const plans = useMemo(() => {
    const s = new Set(customers.map((c) => c.planName).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    let rows = customers;
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q)
      );
    }
    if (planFilter !== "all") {
      rows = rows.filter((c) => c.planName === planFilter);
    }
    return [...rows].sort((a, b) => {
      switch (sort) {
        case "mrr": return b.mrrCents - a.mrrCents;
        case "mrr_asc": return a.mrrCents - b.mrrCents;
        case "billed": return b.ltdCents - a.ltdCents;
        case "tenure": return b.tenureMonths - a.tenureMonths;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [customers, query, sort, planFilter]);

  const top = filtered[0]?.mrrCents ?? 1;

  return (
    <section className="overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-6 pb-3 pt-5">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
            All customers
            <span className="ml-2 rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-lx-muted">
              {filtered.length}
            </span>
          </p>
        </div>
        <a
          href="/api/export/customers"
          download
          className="text-[11px] font-medium text-[#5e6ad2] hover:opacity-70"
        >
          Export CSV ↓
        </a>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#f0f0f0] px-6 pb-3">
        {/* Search */}
        <div className="relative min-w-[180px] flex-1">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lx-faint" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="4.5" /><path d="M11 11l3 3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-sm border border-[#e8e8e8] bg-[#fafafa] py-1.5 pl-7 pr-3 text-[12px] text-lx-text placeholder:text-lx-faint focus:border-[#5e6ad2] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20"
          />
        </div>

        {/* Plan filter */}
        {plans.length > 0 && (
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-sm border border-[#e8e8e8] bg-[#fafafa] py-1.5 pl-2.5 pr-6 text-[12px] text-lx-text focus:border-[#5e6ad2] focus:outline-none"
          >
            <option value="all">All plans</option>
            {plans.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-sm border border-[#e8e8e8] bg-[#fafafa] py-1.5 pl-2.5 pr-6 text-[12px] text-lx-text focus:border-[#5e6ad2] focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="px-6 py-8 text-[13px] text-lx-faint">No customers match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-lx-faint">
                <th className="px-6 pb-2 pt-3 text-left">Customer</th>
                <th className="pb-2 pr-4 pt-3 text-left">Plan</th>
                <th className="pb-2 pr-4 pt-3 text-right">Tenure</th>
                <th className="pb-2 pr-4 pt-3 text-right">Billed</th>
                <th className="pb-2 pr-6 pt-3 text-right">MRR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="group transition-colors hover:bg-lx-sidebar" style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td className="py-2.5 pl-6 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size={32} />
                      <div className="min-w-0">
                        {c.customerId ? (
                          <Link
                            href={`/app/customers/${c.customerId}?connection=${connectionId}&name=${encodeURIComponent(c.name)}&pname=${encodeURIComponent(productLabel)}`}
                            className="block truncate text-[13px] font-medium text-lx-text hover:text-lx-purple hover:underline"
                          >
                            {c.name}
                          </Link>
                        ) : (
                          <p className="truncate text-[13px] font-medium text-lx-text">{c.name}</p>
                        )}
                        <p className="flex items-center gap-1.5 truncate text-[11px] text-lx-faint">
                          {c.country && <CountryMark code={c.country} />}
                          {c.country ?? "—"}{c.source ? ` · ${c.source}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    {c.planName
                      ? <Pill label={c.planName} tint={planTint(c.planName)} />
                      : <span className="text-[12px] text-lx-faint">—</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-[12px] tabular-nums text-lx-muted">
                    {c.tenureMonths.toFixed(0)} mo
                  </td>
                  <td className="py-2.5 pr-4 text-right text-[12px] tabular-nums text-lx-muted">
                    {fmtMrr(c.ltdCents)}
                  </td>
                  <td className="py-2.5 pr-6 text-right">
                    <p className="text-[13px] font-semibold tabular-nums text-lx-text">{fmtMrr(c.mrrCents)}</p>
                    <div className="ml-auto mt-1 h-[3px] w-14 overflow-hidden rounded-full" style={{ background: "#f0f0f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${(c.mrrCents / top) * 100}%`, background: planTint(c.planName) }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
