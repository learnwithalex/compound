"use client";
import Link from "next/link";

const FAQS = [
  {
    q: "How do I connect a payment provider?",
    a: "Go to Connect in the sidebar, choose your provider, paste your read-only API key, and click Save. Compound verifies the key immediately and starts syncing your data.",
  },
  {
    q: "Is my API key safe?",
    a: "Yes. API keys are encrypted at rest and are never exposed in the UI after saving. We only use them to fetch your revenue data — no writes or charges are ever made.",
  },
  {
    q: "How often does Compound sync data?",
    a: "Data syncs automatically every 30 seconds in the background. You can also trigger a manual sync from the Connect page.",
  },
  {
    q: "What providers does Compound support?",
    a: "Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack. More providers are on the roadmap.",
  },
  {
    q: "Can I connect multiple accounts from the same provider?",
    a: "Yes. You can add as many connections as you need — for example, multiple Stripe accounts for different products or businesses.",
  },
  {
    q: "How do AI briefings work?",
    a: "After each sync, Compound sends your aggregated revenue metrics to Claude (Anthropic) to generate a plain-English summary of what moved and why. No individual customer data is included.",
  },
  {
    q: "How do I share my portfolio publicly?",
    a: "Go to Settings → Public page, enable it, and set a slug. Your public page will be live at usecompound.xyz/u/your-slug.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Billing in the sidebar and click Manage subscription. From there you can cancel at any time — you'll retain access until the end of the billing period.",
  },
];

const RESOURCES = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Email support", href: "mailto:support@usecompound.xyz" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-10">
      <h1 className="text-[22px] font-bold tracking-tight text-[#111111]" style={{ letterSpacing: "-0.025em" }}>
        Help
      </h1>
      <p className="mt-1 text-[14px] text-[#6b6b6b]">Answers to common questions about Compound.</p>

      <div className="mt-8 space-y-px">
        {FAQS.map(({ q, a }) => (
          <FAQItem key={q} question={q} answer={a} />
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-5">
        <p className="text-[13px] font-semibold text-[#111111]">Still stuck?</p>
        <p className="mt-1 text-[13px] text-[#6b6b6b]">
          Email us at{" "}
          <a href="mailto:support@usecompound.xyz" className="font-medium text-[#5e6ad2] hover:opacity-80">
            support@usecompound.xyz
          </a>{" "}
          and we&apos;ll get back to you within one business day.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        {RESOURCES.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-[13px] text-[#a0a0a0] underline underline-offset-2 hover:text-[#565656]"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-lg border border-[#ebebeb] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-[13px] font-medium text-[#111111] hover:bg-[#fafafa]">
        {question}
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[#a0a0a0] transition-transform group-open:rotate-180"
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </summary>
      <div className="border-t border-[#f0ede8] px-4 py-3.5 text-[13px] leading-relaxed text-[#565656]">
        {answer}
      </div>
    </details>
  );
}
