export function fmtMrr(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  if (dollars >= 1e6) return `$${(dollars / 1e6).toFixed(2)}M`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function fmtDollars(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const PRODUCT_ICONS: [RegExp, string][] = [
  [/better\s*flow/i, "/betterflow-icon.png"],
  [/obsidian/i, "/obsidian-sync-icon.jpg"],
  [/event\s*organizer/i, "/event-organizer-icon.svg"],
];

export function providerLogo(provider: string): string {
  const key = provider.toLowerCase().replace(/[^a-z]/g, "");
  return (
    {
      stripe: "https://cdn.simpleicons.org/stripe/635bff",
      lemonsqueezy: "https://cdn.simpleicons.org/lemonsqueezy/e5a00d",
      polar: "/polar-icon.svg",
      dodopayments: "/dodopayments-icon.svg",
      paddle: "https://cdn.simpleicons.org/paddle/0066ff",
      gumroad: "https://cdn.simpleicons.org/gumroad/ff90e8",
      paystack: "/paystack-icon.png",
    } as Record<string, string>
  )[key] ?? "https://cdn.simpleicons.org/stripe/635bff";
}

// Real product icons for known demo products; otherwise the provider logo.
export function productIcon(label: string, provider: string): string {
  for (const [re, icon] of PRODUCT_ICONS) {
    if (re.test(label)) return icon;
  }
  return providerLogo(provider);
}

export interface ShareableProduct {
  connectionId: string;
  label: string;
  color: string;
  provider: string;
  mrrCents: number;
  activeSubscriptions: number;
}

export interface ShareableMetrics {
  totalMrrCents: number;
  totalArrCents: number;
  totalActiveSubscriptions: number;
  netNewMrrCents: number;
  products: ShareableProduct[];
}
