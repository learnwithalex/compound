import Link from "next/link";
import { CompoundWordmark } from "../compound-logo";

export const metadata = {
  title: "Privacy Policy — Compound",
  description: "Compound Privacy Policy",
};

const EFFECTIVE = "September 19, 2025";

export default function PrivacyPage() {
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
        <h1 className="mb-2 text-[36px] font-bold leading-tight tracking-[-0.025em]">Privacy Policy</h1>
        <p className="mb-12 text-[14px] text-[#6b6b6b]">Effective {EFFECTIVE}</p>

        <div className="space-y-10 text-[15px] leading-[1.75] text-[#3d3d3d]">

          <section>
            <p>
              Compound (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, how we use it, and
              your rights in relation to it. By using Compound, you agree to the practices
              described in this policy.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <p className="font-medium text-[#1a1a1a]">Information you provide:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Email address (used for authentication and transactional emails)</li>
              <li>Payment provider API keys (encrypted, used solely for data sync)</li>
              <li>Product names, labels, and website URLs you enter in the dashboard</li>
            </ul>
            <p className="mt-4 font-medium text-[#1a1a1a]">Information collected automatically:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Log data including IP address, browser type, and pages visited</li>
              <li>Session tokens stored in cookies to keep you signed in</li>
              <li>Aggregate usage patterns (feature interactions, page views) — never tied to individual revenue figures</li>
            </ul>
            <p className="mt-4 font-medium text-[#1a1a1a]">Revenue data synced from your providers:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>MRR, ARR, transaction totals, subscriber counts, and related metrics</li>
              <li>This data belongs to you. We process it only to power your dashboard.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To authenticate your account and maintain your session</li>
              <li>To sync revenue data from connected payment providers</li>
              <li>To generate AI briefings and portfolio analytics</li>
              <li>To send transactional emails (magic links, billing receipts)</li>
              <li>To improve the reliability and features of the service</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-4">
              We do not sell your data, use your revenue figures for advertising, or share
              personal information with third parties for their own marketing purposes.
            </p>
          </Section>

          <Section title="3. Data Sharing">
            <p>We share data only with:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <span className="font-medium text-[#1a1a1a]">Infrastructure providers</span> — cloud
                hosting, database, and email services necessary to operate Compound (e.g.
                Neon, Resend). These providers are contractually bound to protect your data.
              </li>
              <li>
                <span className="font-medium text-[#1a1a1a]">AI processing</span> — revenue summaries
                are sent to an AI model (Anthropic Claude) to generate briefings. No data is
                retained by the AI provider beyond the immediate request.
              </li>
              <li>
                <span className="font-medium text-[#1a1a1a]">Legal requirements</span> — if required
                by law, court order, or to protect the safety of our users or the public.
              </li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account data for as long as your account is active. When you
              delete your account, we permanently delete your personal data and stored API keys
              within 30 days. Anonymized, aggregated analytics data may be retained longer as
              it cannot be linked back to you.
            </p>
          </Section>

          <Section title="5. Security">
            <p>
              API keys are encrypted at rest using industry-standard encryption. Sessions are
              managed via secure, HttpOnly cookies. We use HTTPS for all data in transit.
              We perform regular security reviews, but no system is perfectly secure — if you
              discover a vulnerability, please disclose it responsibly to{" "}
              <a href="mailto:support@usecompound.xyz" className="text-[#5e6ad2] underline underline-offset-2">
                support@usecompound.xyz
              </a>.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Compound uses cookies strictly necessary for operation — primarily to maintain
              your authenticated session. We do not use third-party tracking cookies or
              advertising pixels. You can configure your browser to refuse cookies, but this
              will prevent you from staying signed in.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability (receive your data in a machine-readable format)</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email{" "}
              <a href="mailto:support@usecompound.xyz" className="text-[#5e6ad2] underline underline-offset-2">
                support@usecompound.xyz
              </a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Compound is not directed at children under 16. We do not knowingly collect
              personal information from anyone under 16. If we become aware that we have done
              so, we will delete that information promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you by email
              or in-app notice before material changes take effect. The updated policy will
              always be available at this URL with the new effective date.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions or concerns about your privacy? Contact us at{" "}
              <a href="mailto:support@usecompound.xyz" className="text-[#5e6ad2] underline underline-offset-2">
                support@usecompound.xyz
              </a>.
            </p>
          </Section>
        </div>

        <div className="mt-16 border-t border-[#f0ede8] pt-8 text-[13px] text-[#b0aba3]">
          <Link href="/terms" className="underline underline-offset-2 hover:text-[#6b6b6b]">Terms of Service</Link>
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
