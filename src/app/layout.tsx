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
      <body className="min-h-screen font-sans antialiased">
        <NextTopLoader color="#5e6ad2" height={2} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
