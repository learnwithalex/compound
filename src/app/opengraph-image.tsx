import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#f5f7f7",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(94,106,210,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 44,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#5e6ad2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M22.4 8.3c-2-1.6-4.6-2.5-7.5-2.5C8 5.8 3 10.7 3 16.9c0 6.1 5 11 11.9 11 2.9 0 5.5-.9 7.5-2.5l-3.4-4.2c-1.1.9-2.6 1.4-4.1 1.4-3.7 0-6.5-2.7-6.5-6 0-3.4 2.8-6.1 6.5-6.1 1.5 0 3 .5 4.1 1.4l3.4-3.6Z"
                fill="white"
              />
            </svg>
          </div>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            Compound
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#1a1a1a",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: 0,
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          Revenue OS for indie hackers
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 22,
            color: "#6b7280",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          All your Stripe, Lemon Squeezy, and Polar revenue in one dashboard.
          With AI that explains why your MRR moved.
        </p>

        {/* Bottom badges */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 52,
          }}
        >
          {["Stripe", "Lemon Squeezy", "Polar", "Paystack", "DodoPayments"].map((p) => (
            <div
              key={p}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: "white",
                border: "1px solid #e5e7eb",
                fontSize: 15,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            right: 96,
            fontSize: 16,
            color: "#9ca3af",
            fontWeight: 500,
          }}
        >
          usecompound.xyz
        </div>
      </div>
    ),
    { ...size }
  );
}
