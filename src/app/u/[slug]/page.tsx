import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { portfolioMetrics } from "@/lib/metrics";
import { fmtMrr, productIcon } from "@/lib/format";
import { milestoneFor } from "@/lib/insights";
import { CompoundWordmark } from "@/app/compound-logo";
import { TrendChart } from "@/app/app/trend-chart";

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

  // Portfolio history isn't tracked on its own — sum each product's daily
  // snapshot by date so the chart shows one combined trend, not per-product.
  const historyByDate = new Map<string, number>();
  for (const p of metrics.products) {
    for (const h of p.history) {
      historyByDate.set(h.date, (historyByDate.get(h.date) ?? 0) + h.mrrCents);
    }
  }
  const trend = [...historyByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  const milestone = milestoneFor(metrics.totalMrrCents);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f4]">
      <header className="flex items-center justify-between px-8 py-5">
        <a href="https://usecompound.xyz">
          <CompoundWordmark theme="light" height={18} />
        </a>
        <span className="text-[12px] text-[#a8a39b]">Live stats · updates every 5 min</span>
      </header>

      <main className="mx-auto w-full max-w-[480px] px-6 py-10">
        {/* Profile byline — no card, no banner; sits on the page like an author line */}
        <div className="mb-8 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3.5">
            <div
              className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-[15px] font-bold text-white overflow-hidden"
              style={{ background: settings.avatarUrl ? undefined : "#5e6ad2" }}
            >
              {settings.avatarUrl
                ? <img src={settings.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                : initials}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-[16px] font-extrabold text-[#1a1a1a]" style={{ letterSpacing: "-0.02em" }}>{displayName}</p>
                {settings.xHandle && (
                  <a
                    href={`https://x.com/${settings.xHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12.5px] text-[#a8a39b] hover:text-[#5c5c5c] transition-colors"
                  >
                    @{settings.xHandle}
                  </a>
                )}
              </div>
              {settings.bio && (
                <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: "#8a8580" }}>{settings.bio}</p>
              )}
            </div>
          </div>

          {(settings.xHandle || settings.githubHandle) && (
            <div className="flex shrink-0 flex-col items-stretch gap-1.5 pt-0.5">
              {settings.xHandle && (
                <a
                  href={`https://x.com/${settings.xHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-white transition-opacity hover:opacity-85"
                  style={{ background: "#0a0a0a" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Follow
                </a>
              )}
              {settings.githubHandle && (
                <a
                  href={`https://github.com/${settings.githubHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors hover:bg-[#f0efe9]"
                  style={{ border: "1px solid #ddd9d0", color: "#1a1a1a" }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mb-5 overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
          <div className="p-6 pb-0">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8a39b]">
              Portfolio · {ranked.length} product{ranked.length !== 1 ? "s" : ""}
            </p>

            {settings.publicShowMrr && (
              <p className="mt-3 text-[52px] font-bold tabular-nums leading-none text-[#1a1a1a]" style={{ letterSpacing: "-0.03em" }}>
                {fmtMrr(metrics.totalMrrCents)}
                <span className="ml-2 text-[16px] font-medium text-[#a8a39b]">MRR</span>
              </p>
            )}
          </div>

          {settings.publicShowMrr && trend.length > 1 && (
            <div className="px-2 pt-4">
              <TrendChart series={trend} color="#5e6ad2" height={160} animate />
            </div>
          )}

          <div className="mt-2 grid grid-cols-3 gap-px overflow-hidden" style={{ background: "#ebebeb" }}>
            <Stat label="ARR" value={fmtMrr(metrics.totalArrCents)} />
            <Stat
              label="Net new · 30d"
              value={`${metrics.netNewMrrCents >= 0 ? "+" : "−"}${fmtMrr(Math.abs(metrics.netNewMrrCents))}`}
              color={metrics.netNewMrrCents >= 0 ? "#0f9b6c" : "#c8392c"}
            />
            <Stat label="Active subs" value={metrics.totalActiveSubscriptions.toLocaleString()} />
          </div>

          {settings.publicShowMrr && (
            <div className="border-t border-[#ebebeb] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-[15px]">🏁</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-[#1a1a1a]">
                    {fmtMrr(milestone.prevCents)} → {fmtMrr(milestone.nextCents)} MRR
                  </p>
                  <p className="text-[10.5px] text-[#a8a39b]">{fmtMrr(milestone.toGoCents)} to go</p>
                </div>
                <span className="shrink-0 rounded-md px-2 py-1 text-[12px] font-bold tabular-nums" style={{ background: "#eff0fb", color: "#5e6ad2" }}>
                  {milestone.pct.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(milestone.pct, 100)}%`, background: "#5e6ad2" }} />
              </div>
            </div>
          )}
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
