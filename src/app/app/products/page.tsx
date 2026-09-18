import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, type ProductMetrics } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { MiniChart } from "../mini-chart";
import { DeleteProductButton } from "./delete-button";

export default async function ProductsPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const metrics = await portfolioMetrics(userId);
  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Products</p>
          <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            Your products
          </h1>
        </div>
        <a
          href="/app/connect"
          className="inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#5e6ad2" }}
        >
          + Add product
        </a>
      </div>

      {ranked.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ranked.map((p, i) => (
            <ProductCard key={p.connectionId} product={p} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p, rank }: { product: ProductMetrics; rank: number }) {
  const change = p.mrrChange30d;
  const up = change > 0;
  const down = change < 0;
  const icon = productIcon(p.label, p.provider, p.websiteUrl);

  return (
    <div
      className="group relative overflow-hidden rounded-sm bg-white pb-4 transition-colors hover:border-[#dcdcdc]"
      style={{ border: "1px solid #ebebeb" }}
    >
      <a
        href={`/app/products/${p.connectionId}?name=${encodeURIComponent(p.label)}`}
        className="block"
      >
        <div className="mb-1 flex items-center gap-2.5 px-5 pt-4">
          <span className="w-3 shrink-0 text-[11px] font-medium tabular-nums text-lx-faint">{rank}</span>
          <img
            src={icon}
            alt={p.label}
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-sm object-cover"
            style={{ border: "1px solid #ebebeb" }}
            loading="lazy"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold text-lx-text">{p.label}</span>
            <span className="flex items-center gap-1 text-[10.5px] text-lx-faint">
              {p.provider} · {p.activeSubscriptions.toLocaleString()} subs
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-[17px] font-semibold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>
              {fmtMrr(p.mrrCents)}
            </span>
            <span
              className="block whitespace-nowrap text-[10.5px] font-medium tabular-nums"
              style={{ color: up ? "#0f9b6c" : down ? "#c8392c" : "#9a9a9a" }}
            >
              {up ? "+" : ""}{change.toFixed(1)}% · 30d
            </span>
          </span>
        </div>

        {p.history.length > 1 && (
          <div className="px-5">
            <MiniChart data={p.history.map((h) => h.mrrCents)} color={up ? "#10b981" : down ? "#e3493c" : "#b4b4b4"} />
          </div>
        )}
      </a>

      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteProductButton connectionId={p.connectionId} label={p.label} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-6" />
        </svg>
      </div>
      <h2 className="mb-2 text-[16px] font-bold text-lx-text">No products connected yet</h2>
      <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-lx-muted">
        Connect a Stripe, Lemon Squeezy, Polar, Paddle, Gumroad, or Paystack account to get started.
      </p>
      <a
        href="/app/connect"
        className="inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#5e6ad2" }}
      >
        Add your first product →
      </a>
    </div>
  );
}
