import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Compound — Revenue OS for indie hackers",
  description:
    "Connect all your Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack accounts. Compound shows your total MRR across every product, with AI that explains why your numbers moved.",
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
        <NextTopLoader color="#5e6ad2" height={2} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
