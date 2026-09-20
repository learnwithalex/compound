import { ImageResponse } from "next/og";
import { db } from "@/db";
import { portfolioMetrics } from "@/lib/metrics";
import { fmtMrr } from "@/lib/format";

export const alt = "Revenue dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function ownerName(email: string) {
  const raw = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return raw
    ? raw.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Someone";
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const settings = await db.query.userSettings.findFirst({
    where: (s, { eq }) => eq(s.publicSlug, slug),
  });

  const fallback = (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#111111",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ color: "#ffffff", fontSize: 32, fontWeight: 700 }}>compound</span>
    </div>
  );

  if (!settings || !settings.publicPageEnabled) {
    return new ImageResponse(fallback, size);
  }

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, settings.userId),
  });
  if (!user) return new ImageResponse(fallback, size);

  const metrics = await portfolioMetrics(settings.userId);
  const ranked = [...metrics.products].sort((a, b) => b.mrrCents - a.mrrCents);
  const displayName = settings.displayName || ownerName(user.email ?? "");
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const netNew = metrics.netNewMrrCents;
  const netNewPositive = netNew >= 0;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#0f0f0f",
        padding: "56px 64px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
        {/* Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "#5e6ad2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 700,
              border: "2px solid rgba(94,106,210,0.4)",
            }}
          >
            {initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
              {displayName}
            </span>
            {settings.xHandle && (
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
                @{settings.xHandle}
              </span>
            )}
          </div>
        </div>
        {/* Compound badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(94,106,210,0.12)",
            border: "1px solid rgba(94,106,210,0.3)",
            borderRadius: 8,
            padding: "8px 16px",
          }}
        >
          <span style={{ color: "#5e6ad2", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            compound
          </span>
        </div>
      </div>

      {/* Big MRR */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 40 }}>
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Monthly Recurring Revenue
        </span>
        {settings.publicShowMrr ? (
          <span
            style={{
              color: "#ffffff",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {fmtMrr(metrics.totalMrrCents)}
          </span>
        ) : (
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            ●●●●
          </span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 0, marginBottom: 48 }}>
        {[
          {
            label: "Net new · 30d",
            value: `${netNewPositive ? "+" : "−"}${fmtMrr(Math.abs(netNew))}`,
            color: netNewPositive ? "#34d399" : "#f87171",
          },
          {
            label: "Active subs",
            value: metrics.totalActiveSubscriptions.toLocaleString(),
            color: "#ffffff",
          },
          {
            label: "Products",
            value: ranked.length.toString(),
            color: "#ffffff",
          },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingRight: 40,
              marginRight: 40,
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </span>
            <span
              style={{ color: s.color, fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom: product pills + URL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {ranked.slice(0, 4).map((p) => (
            <div
              key={p.connectionId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                padding: "5px 12px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: p.color,
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
        <span
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 14,
            fontFamily: "monospace",
          }}
        >
          usecompound.xyz/u/{slug}
        </span>
      </div>
    </div>,
    size,
  );
}
