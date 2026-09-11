"use client";

const DOT = "#ff5c00";
const INK = "#1a1a2e";
const PAPER = "#ffffff";

/**
 * Square app-mark — logoipsum #433 (horizontal-bar globe), recolored to
 * Compound navy. Renders inside a rounded tile in dark contexts.
 */
export function CompoundMark({
  size = 28,
  theme = "light",
}: {
  size?: number;
  theme?: "light" | "dark";
}) {
  const bg = theme === "dark" ? INK : "transparent";
  const fill = theme === "dark" ? PAPER : INK;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={
        theme === "dark"
          ? { width: size, height: size, background: bg, borderRadius: Math.round(size * 0.26) }
          : { width: size, height: size }
      }
    >
      <svg
        width={size * (theme === "dark" ? 0.72 : 1)}
        height={size * (theme === "dark" ? 0.72 : 1)}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path fill={fill} d="M16.3662 34.0674C16.7359 35.7784 18.2495 37 20 37C21.7505 37 23.2641 35.7784 23.6338 34.0674L23.8643 33H35.1982C31.5301 37.2844 26.0824 40 20 40C13.9176 40 8.46992 37.2844 4.80176 33H16.1357L16.3662 34.0674Z"/>
        <path fill={fill} d="M14.8389 27H25.1611L26.2412 22H39.9004C39.6525 24.4971 38.9451 26.8588 37.8643 29H2.13574C1.05487 26.8588 0.347551 24.4971 0.0996094 22H13.7588L14.8389 27Z"/>
        <path fill={fill} d="M12.4619 16H27.5381L28.6182 11H40V18H0V11H11.3818L12.4619 16Z"/>
        <path fill={fill} d="M0.738281 0C4.29632 0.213097 7.45893 2.11968 9.33789 5H30.708C32.6244 2.11683 35.8152 0.212879 39.3994 0H40V7H0V0H0.738281Z"/>
      </svg>
    </span>
  );
}

/** Full wordmark: icon mark + "compound" text + orange dot */
export function CompoundWordmark({
  theme = "light",
  height = 26,
}: {
  theme?: "light" | "dark";
  height?: number;
}) {
  const fg = theme === "light" ? INK : PAPER;
  const iconSize = Math.round(height * 1.1);
  const fontSize = Math.round(height * 0.85);
  const dotSize = Math.round(height * 0.22);

  return (
    <span
      aria-label="compound"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(height * 0.35),
      }}
    >
      <CompoundMark size={iconSize} theme={theme} />
      <span
        style={{
          display: "inline-flex",
          alignItems: "flex-start",
          gap: 2,
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: fg,
          lineHeight: 1,
          fontFamily: "var(--font-dm-sans, system-ui, sans-serif)",
          userSelect: "none",
        }}
      >
        compound
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: DOT,
            flexShrink: 0,
            marginTop: 1,
          }}
        />
      </span>
    </span>
  );
}
