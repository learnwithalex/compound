"use client";
import { useEffect, useState } from "react";
import { appUrl } from "@/lib/auth";

interface Settings {
  digestEnabled: boolean;
  digestDay: number;
  milestoneAlerts: boolean;
  publicPageEnabled: boolean;
  publicSlug: string | null;
  publicShowMrr: boolean;
  publicShowProducts: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [slugInput, setSlugInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [slugError, setSlugError] = useState("");
  const [testDigestState, setTestDigestState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((s: Settings) => {
      setSettings(s);
      setSlugInput(s.publicSlug ?? "");
    });
  }, []);

  async function patch(key: string, value: unknown) {
    setSaving(key);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    const updated = await res.json();
    if (res.status === 409) { setSlugError("That slug is already taken"); setSaving(null); return; }
    setSlugError("");
    setSettings(updated);
    setSaving(null);
  }

  async function sendTestDigest() {
    setTestDigestState("sending");
    const res = await fetch("/api/digest", { method: "POST" });
    setTestDigestState(res.ok ? "sent" : "error");
    setTimeout(() => setTestDigestState("idle"), 3000);
  }

  if (!settings) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
    </div>
  );

  const publicUrl = settings.publicSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${settings.publicSlug}` : null;
  const embedCode = publicUrl ? `<iframe src="${publicUrl}/embed" width="320" height="160" frameborder="0" style="border-radius:8px"></iframe>` : null;

  return (
    <div className="max-w-[600px] pb-20">
      <h1 className="mb-8 text-[22px] font-bold text-lx-text" style={{ letterSpacing: "-0.02em" }}>Settings</h1>

      {/* Notifications */}
      <Section title="Notifications">
        <Toggle
          label="Weekly digest email"
          description="Get an AI-written briefing of your portfolio delivered to your inbox each week."
          checked={settings.digestEnabled}
          saving={saving === "digestEnabled"}
          onChange={(v) => patch("digestEnabled", v)}
        />
        {settings.digestEnabled && (
          <div className="mt-3 flex items-center gap-3 pl-1">
            <label className="text-[12px] text-lx-muted">Send on</label>
            <select
              value={settings.digestDay}
              onChange={(e) => patch("digestDay", Number(e.target.value))}
              className="rounded-sm bg-white px-2 py-1 text-[12px] text-lx-text focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30"
              style={{ border: "1px solid #ebebeb" }}
            >
              {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
            </select>
            <button
              onClick={sendTestDigest}
              disabled={testDigestState === "sending"}
              className="text-[12px] text-[#5e6ad2] hover:opacity-80 disabled:opacity-50"
            >
              {testDigestState === "sending" ? "Sending…" : testDigestState === "sent" ? "Sent ✓" : testDigestState === "error" ? "Failed" : "Send test now"}
            </button>
          </div>
        )}

        <Divider />

        <Toggle
          label="Milestone alerts"
          description="Get notified by email when your portfolio crosses a new MRR milestone ($1k, $5k, $10k…)."
          checked={settings.milestoneAlerts}
          saving={saving === "milestoneAlerts"}
          onChange={(v) => patch("milestoneAlerts", v)}
        />
      </Section>

      {/* Public page */}
      <Section title="Public page">
        <Toggle
          label="Enable public stats page"
          description="Share a live view of your portfolio at a public URL — you control what's visible."
          checked={settings.publicPageEnabled}
          saving={saving === "publicPageEnabled"}
          onChange={(v) => patch("publicPageEnabled", v)}
        />

        {settings.publicPageEnabled && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-lx-muted">Your public URL</label>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-lx-faint">usecompound.xyz/u/</span>
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  onBlur={() => slugInput && patch("publicSlug", slugInput)}
                  placeholder="your-name"
                  className="flex-1 rounded-sm bg-white px-3 py-1.5 text-[13px] text-lx-text focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/25"
                  style={{ border: "1px solid #ebebeb" }}
                />
                {publicUrl && (
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[12px] text-[#5e6ad2] hover:opacity-80">
                    View →
                  </a>
                )}
              </div>
              {slugError && <p className="mt-1 text-[11px] text-[#e3493c]">{slugError}</p>}
            </div>

            <Toggle
              label="Show MRR"
              description="Display your total MRR on the public page."
              checked={settings.publicShowMrr}
              saving={saving === "publicShowMrr"}
              onChange={(v) => patch("publicShowMrr", v)}
            />
            <Toggle
              label="Show products"
              description="Show a breakdown of MRR by product."
              checked={settings.publicShowProducts}
              saving={saving === "publicShowProducts"}
              onChange={(v) => patch("publicShowProducts", v)}
            />

            {embedCode && (
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-lx-muted">Embed widget</label>
                <p className="mb-2 text-[12px] text-lx-faint">Drop this on your personal site to show a live MRR badge.</p>
                <pre
                  className="overflow-x-auto rounded-sm p-3 text-[11px] leading-relaxed text-lx-muted"
                  style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
                >{embedCode}</pre>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Account */}
      <Section title="Account">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-lx-text">Sign out</p>
            <p className="text-[12px] text-lx-faint">End your current session.</p>
          </div>
          <a
            href="/api/auth/signout"
            className="rounded-sm px-3 py-1.5 text-[12px] font-medium text-lx-muted transition-colors hover:bg-[#fafafa] hover:text-lx-text"
            style={{ border: "1px solid #ebebeb" }}
          >
            Sign out
          </a>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{title}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-4" style={{ borderTop: "1px solid #f0f0f0" }} />;
}

function Toggle({
  label, description, checked, saving, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  saving: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-lx-text">{label}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-lx-faint">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={saving}
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50"
        style={{ background: checked ? "#5e6ad2" : "#e0e0e0" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    </div>
  );
}
