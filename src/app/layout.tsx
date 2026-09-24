import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Analytics } from "@orizon-sdk/analytics/react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const APP_URL = "https://usecompound.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Compound — Revenue OS for indie hackers",
    template: "%s — Compound",
  },
  description:
    "Connect every Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack account. One dashboard for your whole portfolio, with AI that explains why your numbers moved.",
  keywords: ["MRR dashboard", "indie hacker revenue", "Stripe MRR", "SaaS analytics", "revenue tracking", "Lemon Squeezy analytics", "Polar analytics"],
  authors: [{ name: "Compound" }],
  creator: "Compound",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Compound",
    title: "Compound — Revenue OS for indie hackers",
    description:
      "Connect every Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack account. One dashboard for your whole portfolio, with AI that explains why your numbers moved.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Compound — Revenue OS for indie hackers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compound — Revenue OS for indie hackers",
    description:
      "Connect every Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack account. One dashboard for your whole portfolio, with AI that explains why your numbers moved.",
    images: ["/og-image.png"],
    creator: "@usecompound",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        {/* Compound analytics */}
        <script dangerouslySetInnerHTML={{ __html: `!function(w){w._cmpd=w._cmpd||{_q:[]};['identify','track','page'].forEach(function(m){w._cmpd[m]=function(){w._cmpd._q.push([m,Array.from(arguments)])};})}(window);` }} />
        <script async src="https://usecompound.xyz/t.js?k=cmpd_950f43e3335045e2810c10b3f5659a32" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Analytics project="proj_compound" />
        <NextTopLoader color="#5e6ad2" height={2} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
