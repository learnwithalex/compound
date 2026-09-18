import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { portfolioMetrics } from "@/lib/metrics";
import { fmtMrr, productIcon } from "@/lib/format";
import { CompoundWordmark } from "@/app/compound-logo";

export const revalidate = 300;

async function loadPublicData(slug: string) {
  const settings = await db.query.userSettings.findFirst({
    where: (s, { eq }) => eq(s.publicSlug, slug),
  });
  if (!settings || !settings.publicPageEnabled) return null;
  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, settings.userId) });
  if (!user) return null;
  const metrics = await portfolioMetrics(settings.userId);
  return { settings, metrics, user };
}

function ownerName(email: string) {
  const raw = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return raw ? raw.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Someone";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPublicData(slug);
  if (!data) return { title: "Not found" };

  const { metrics, user, settings } = data;
  const name = settings.displayName || ownerName(user.email ?? "");
  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);
  const productNames = ranked.slice(0, 2).map((p) => p.label).join(" & ");
  const title = productNames ? `${name}'s revenue — ${productNames}` : `${name}'s revenue dashboard`;
  const description = `${fmtMrr(metrics.totalMrrCents)} MRR across ${ranked.length} product${ranked.length !== 1 ? "s" : ""}. Live stats powered by Compound.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadPublicData(slug);
  if (!data) notFound();

  const { settings, metrics, user } = data;

  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);
  const top = ranked[0]?.mrrCents ?? 1;
  const displayName = settings.displayName || ownerName(user.email ?? "");
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f4]">
      <header className="flex items-center justify-between px-8 py-5">
        <a href="https://usecompound.xyz">
          <CompoundWordmark theme="light" height={18} />
        </a>
        <span className="text-[12px] text-[#a8a39b]">Live stats · updates every 5 min</span>
      </header>

      <main className="mx-auto w-full max-w-[480px] px-6 py-10">
        {/* Profile hero */}
        <div className="mb-5 rounded-sm bg-white overflow-hidden" style={{ border: "1px solid #ebebeb" }}>
          <div className="relative h-[80px]" style={{ background: "linear-gradient(135deg, #5e6ad2 0%, #4a54c0 100%)" }}>
            <div
              className="absolute left-1/2 -bottom-8 -translate-x-1/2 h-16 w-16 rounded-full flex items-center justify-center text-[20px] font-bold text-white overflow-hidden"
              style={{ background: settings.avatarUrl ? undefined : "#5e6ad2", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            >
              {settings.avatarUrl
                ? <img src={settings.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                : initials}
            </div>
          </div>
          <div className="pt-10 pb-6 px-6 text-center">
            <p className="text-[16px] font-bold text-[#1a1a1a]" style={{ letterSpacing: "-0.02em" }}>{displayName}</p>
            {settings.xHandle && (
              <a
                href={`https://x.com/${settings.xHandle}`}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[#a8a39b] hover:text-[#1a1a1a] transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @{settings.xHandle}
              </a>
            )}
            {settings.bio && (
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#6b6b6b" }}>{settings.bio}</p>
            )}
          </div>
        </div>

        <div className="mb-5 rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8a39b]">
            Portfolio · {ranked.length} product{ranked.length !== 1 ? "s" : ""}
          </p>

          {settings.publicShowMrr && (
            <p className="mt-3 text-[40px] font-bold tabular-nums text-[#1a1a1a]" style={{ letterSpacing: "-0.03em" }}>
              {fmtMrr(metrics.totalMrrCents)}
              <span className="ml-2 text-[16px] font-medium text-[#a8a39b]">MRR</span>
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-sm" style={{ background: "#ebebeb" }}>
            <Stat label="ARR" value={fmtMrr(metrics.totalArrCents)} />
            <Stat
              label="Net new · 30d"
              value={`${metrics.netNewMrrCents >= 0 ? "+" : "−"}${fmtMrr(Math.abs(metrics.netNewMrrCents))}`}
              color={metrics.netNewMrrCents >= 0 ? "#0f9b6c" : "#c8392c"}
            />
            <Stat label="Active subs" value={metrics.totalActiveSubscriptions.toLocaleString()} />
          </div>
        </div>

        {settings.publicShowProducts && ranked.length > 0 && (
          <div className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8a39b]">Products</p>
            <div className="space-y-3">
              {ranked.map((p) => {
                const up = p.mrrChange30d > 0;
                const flat = p.mrrChange30d === 0;
                return (
                  <div key={p.connectionId} className="flex items-center gap-3">
                    <img src={productIcon(p.label, p.provider, p.websiteUrl ?? undefined, p.iconUrl ?? undefined)} alt="" width={26} height={26} className="h-[26px] w-[26px] shrink-0 rounded-sm object-cover" style={{ border: "1px solid #ebebeb" }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-[#1a1a1a]">{p.label}</span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full" style={{ background: "#f0f0f0" }}>
                        <span className="block h-full rounded-full" style={{ width: `${Math.max(3, (p.mrrCents / top) * 100)}%`, background: p.color }} />
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-bold tabular-nums text-[#1a1a1a]">{fmtMrr(p.mrrCents)}</span>
                      <span className="block text-[10px] font-medium tabular-nums" style={{ color: flat ? "#a8a39b" : up ? "#0f9b6c" : "#c8392c" }}>
                        {up ? "+" : ""}{p.mrrChange30d.toFixed(1)}% · 30d
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-[#c0bdb8]">
          Powered by{" "}
          <a href="https://usecompound.xyz" className="underline underline-offset-2 hover:text-[#6b6b6b]">compound</a>
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#a8a39b]">{label}</p>
      <p className="mt-1 text-[15px] font-bold tabular-nums" style={{ color: color ?? "#1a1a1a", letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}
