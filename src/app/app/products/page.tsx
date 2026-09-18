import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, type ProductMetrics } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { DeleteProductButton } from "./delete-button";

export default async function ProductsPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const metrics = await portfolioMetrics(userId);
  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);

  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Products</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
          Connected products
        </h1>
        <p className="mt-1 text-[13px] text-lx-muted">
          {ranked.length === 0
            ? "No products yet. Add one to start tracking revenue."
            : `${ranked.length} product${ranked.length === 1 ? "" : "s"} syncing revenue data.`}
        </p>
      </div>

      {/* Product list */}
      {ranked.length > 0 && (
        <div className="mb-4 rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
          {ranked.map((p, i) => (
            <ProductRow key={p.connectionId} product={p} divider={i > 0} />
          ))}
        </div>
      )}

      {/* Add product CTA */}
      <a
        href="/app/connect"
        className="flex w-full items-center justify-center gap-2 rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#5e6ad2" }}
      >
        + Add a product
      </a>
    </div>
  );
}

function ProductRow({ product: p, divider }: { product: ProductMetrics; divider: boolean }) {
  const icon = productIcon(p.label, p.provider, p.websiteUrl);
  const up = p.mrrChange30d > 0;
  const down = p.mrrChange30d < 0;

  return (
    <div
      className="group flex items-center gap-3 px-5 py-3.5"
      style={divider ? { borderTop: "1px solid #f0f0f0" } : undefined}
    >
      <img
        src={icon}
        alt={p.label}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-sm object-cover"
        style={{ border: "1px solid #ebebeb" }}
        loading="lazy"
      />

      <a
        href={`/app/products/${p.connectionId}?name=${encodeURIComponent(p.label)}`}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-[13.5px] font-semibold text-lx-text group-hover:text-lx-purple">
          {p.label}
        </p>
        <p className="text-[11px] capitalize text-lx-faint">
          {p.provider} · {p.activeSubscriptions.toLocaleString()} active subs
        </p>
      </a>

      <div className="shrink-0 text-right">
        <p className="text-[14px] font-semibold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>
          {fmtMrr(p.mrrCents)}
        </p>
        <p className="text-[10.5px] tabular-nums" style={{ color: up ? "#0f9b6c" : down ? "#c8392c" : "#b4b4b4" }}>
          {up ? "+" : ""}{p.mrrChange30d.toFixed(1)}%
        </p>
      </div>

      <div className="ml-1 opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteProductButton connectionId={p.connectionId} label={p.label} />
      </div>
    </div>
  );
}
