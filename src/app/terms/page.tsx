import Link from "next/link";
import { CompoundWordmark } from "../compound-logo";

export const metadata = {
  title: "Terms of Service — Compound",
  description: "Compound Terms of Service",
};

const EFFECTIVE = "September 19, 2025";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Nav */}
      <header className="border-b border-[#f0ede8] px-6 py-4">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <Link href="/"><CompoundWordmark theme="light" height={20} /></Link>
          <Link href="/login" className="text-[13px] font-medium text-[#6b6b6b] hover:text-[#1a1a1a]">Sign in →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-16">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-widest text-[#5e6ad2]">Legal</p>
        <h1 className="mb-2 text-[36px] font-bold leading-tight tracking-[-0.025em]">Terms of Service</h1>
        <p className="mb-12 text-[14px] text-[#6b6b6b]">Effective {EFFECTIVE}</p>

        <div className="prose-custom space-y-10 text-[15px] leading-[1.75] text-[#3d3d3d]">

          <section>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Compound
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a revenue intelligence platform for indie hackers and
              small software businesses. By accessing or using Compound, you agree to be bound
              by these Terms. If you do not agree, do not use the service.
            </p>
          </section>

          <Section title="1. The Service">
            <p>
              Compound connects to your payment provider accounts (Stripe, Lemon Squeezy, Polar,
              DodoPayments, Paystack, and others) via read-only API keys and presents unified
              revenue data, AI-generated briefings, and portfolio analytics. We do not process
              payments, hold funds, or initiate transactions on your behalf.
            </p>
          </Section>

          <Section title="2. Your Account">
            <p>
              You must provide a valid email address to create an account. You are responsible
              for maintaining the confidentiality of your login credentials and for all activity
              that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:support@usecompound.xyz" className="text-[#5e6ad2] underline underline-offset-2">
                support@usecompound.xyz
              </a>{" "}
              if you suspect unauthorized access.
            </p>
            <p className="mt-3">
              You must be at least 16 years old to use Compound. By using the service, you
              represent that you meet this requirement.
            </p>
          </Section>

          <Section title="3. API Keys and Connected Accounts">
            <p>
              Compound stores API keys you provide to enable data sync. We encrypt keys at rest
              and never use them for any purpose beyond fetching the revenue data you have
              authorized. You can revoke access at any time by deleting a connection from your
              dashboard, which permanently removes the stored key.
            </p>
            <p className="mt-3">
              You are solely responsible for ensuring the API keys you provide have only the
              permissions required (read-only where available) and comply with the terms of your
              payment providers.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Use the service for any unlawful purpose or in violation of any applicable law</li>
              <li>Attempt to gain unauthorized access to any system, account, or data</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code from Compound</li>
              <li>Resell or sublicense access to the service without our written consent</li>
              <li>Use automated means to scrape or extract data beyond normal product use</li>
              <li>Interfere with or disrupt the service or servers connected to it</li>
            </ul>
          </Section>

          <Section title="5. Subscription and Payment">
            <p>
              Compound offers a paid subscription. Pricing is displayed on our pricing page.
              Subscriptions are billed monthly and renew automatically unless cancelled before
              the renewal date. We use third-party payment processors and do not store your
              full payment card details.
            </p>
            <p className="mt-3">
              Refunds are issued at our discretion. If you believe you were charged in error,
              contact us within 14 days of the charge.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              Compound and all associated software, designs, and content are owned by us or our
              licensors. These Terms do not grant you any ownership rights. You retain all
              rights to your own data — we claim no ownership over your revenue data or business
              information.
            </p>
          </Section>

          <Section title="7. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
              OR COMPLETELY SECURE. AI-GENERATED BRIEFINGS ARE FOR INFORMATIONAL PURPOSES ONLY
              AND SHOULD NOT BE RELIED UPON AS FINANCIAL ADVICE.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPOUND SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
              OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF
              DATA ARISING OUT OF YOUR USE OF THE SERVICE.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              You may close your account at any time from your account settings. We may
              suspend or terminate your access if you violate these Terms or if required by law.
              Upon termination, we will delete your stored API keys and personal data in
              accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify you by email or via
              an in-app notice at least 14 days before material changes take effect. Continued
              use of the service after that date constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:support@usecompound.xyz" className="text-[#5e6ad2] underline underline-offset-2">
                support@usecompound.xyz
              </a>.
            </p>
          </Section>
        </div>

        <div className="mt-16 border-t border-[#f0ede8] pt-8 text-[13px] text-[#b0aba3]">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[#6b6b6b]">Privacy Policy</Link>
          <span className="mx-3">·</span>
          <Link href="/" className="underline underline-offset-2 hover:text-[#6b6b6b]">Back to Compound</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[17px] font-semibold text-[#1a1a1a]">{title}</h2>
      {children}
    </section>
  );
}
