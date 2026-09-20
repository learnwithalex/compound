"use client";
import { useEffect, useRef, useState } from "react";

interface Settings {
  digestEnabled: boolean;
  digestDay: number;
  milestoneAlerts: boolean;
  publicPageEnabled: boolean;
  publicSlug: string | null;
  publicShowMrr: boolean;
  publicShowProducts: boolean;
  alertNewSub: boolean;
  alertChurn: boolean;
  alertUpgrade: boolean;
  alertPastDue: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  xHandle: string | null;
  bio: string | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [slugInput, setSlugInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [slugError, setSlugError] = useState("");
  const [testDigestState, setTestDigestState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [urlCopied, setUrlCopied] = useState(false);

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
    <div className="pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Account</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Settings</h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left: main settings */}
        <div className="min-w-0 flex-1 max-w-[560px] space-y-5">
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

          {/* Real-time alerts */}
          <Section title="Real-time alerts">
            <p className="mb-4 text-[12px] leading-relaxed text-lx-faint">
              Get an email the moment a subscription event happens. Requires a webhook set up in your payment provider — find the webhook URL on the{" "}
              <a href="/app/connect" className="text-[#5e6ad2] underline underline-offset-2 hover:opacity-80">Connect page</a>.
            </p>
            <div className="space-y-4">
              <Toggle label="New subscription" description="Alert when a customer starts a paid subscription." checked={settings.alertNewSub} saving={saving === "alertNewSub"} onChange={(v) => patch("alertNewSub", v)} />
              <Divider />
              <Toggle label="Churn" description="Alert when a customer cancels their subscription." checked={settings.alertChurn} saving={saving === "alertChurn"} onChange={(v) => patch("alertChurn", v)} />
              <Divider />
              <Toggle label="Upgrade" description="Alert when a customer upgrades to a higher plan." checked={settings.alertUpgrade} saving={saving === "alertUpgrade"} onChange={(v) => patch("alertUpgrade", v)} />
              <Divider />
              <Toggle label="Past due" description="Alert when a customer's payment becomes past due." checked={settings.alertPastDue} saving={saving === "alertPastDue"} onChange={(v) => patch("alertPastDue", v)} />
            </div>
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
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#5e6ad2] hover:opacity-80">
                          View →
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(publicUrl).catch(() => {});
                            setUrlCopied(true);
                            setTimeout(() => setUrlCopied(false), 1500);
                          }}
                          className="text-[12px] text-lx-faint hover:text-lx-muted transition-colors"
                        >
                          {urlCopied ? "Copied ✓" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                  {slugError && <p className="mt-1 text-[11px] text-[#e3493c]">{slugError}</p>}
                </div>
                <Toggle label="Show MRR" description="Display your total MRR on the public page." checked={settings.publicShowMrr} saving={saving === "publicShowMrr"} onChange={(v) => patch("publicShowMrr", v)} />
                <Toggle label="Show products" description="Show a breakdown of MRR by product." checked={settings.publicShowProducts} saving={saving === "publicShowProducts"} onChange={(v) => patch("publicShowProducts", v)} />
                {embedCode && (
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-lx-muted">Embed widget</label>
                    <p className="mb-2 text-[12px] text-lx-faint">Drop this on your personal site to show a live MRR badge.</p>
                    <pre className="overflow-x-auto rounded-sm p-3 text-[11px] leading-relaxed text-lx-muted" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>{embedCode}</pre>
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
              <button
                onClick={() => { window.location.href = "/api/auth/signout"; }}
                className="rounded-sm px-3 py-1.5 text-[12px] font-medium text-lx-muted transition-colors hover:bg-[#fafafa] hover:text-lx-text"
                style={{ border: "1px solid #ebebeb" }}
              >
                Sign out
              </button>
            </div>
          </Section>
        </div>

        {/* Right: floating profile card */}
        <div className="w-[280px] shrink-0 sticky top-6">
          <ProfileCard settings={settings} onSave={patch} saving={saving} />
        </div>
      </div>
    </div>
  );
}

function ProfileCard({
  settings,
  onSave,
  saving,
}: {
  settings: Settings;
  onSave: (key: string, value: unknown) => Promise<void>;
  saving: string | null;
}) {
  const [name, setName] = useState(settings.displayName ?? "");
  const [xHandle, setXHandle] = useState(settings.xHandle ?? "");
  const [bio, setBio] = useState(settings.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl ?? "");
  const [avatarInput, setAvatarInput] = useState("");
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  const initials = (settings.displayName || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  function commitAvatar() {
    const url = avatarInput.trim();
    if (!url) return;
    setAvatarUrl(url);
    onSave("avatarUrl", url);
    setShowAvatarInput(false);
    setAvatarInput("");
  }

  return (
    <div className="rounded-sm bg-white overflow-hidden" style={{ border: "1px solid #ebebeb" }}>
      {/* Header strip */}
      <div className="h-[56px]" style={{ background: "linear-gradient(135deg, #5e6ad2 0%, #4a54c0 100%)" }} />

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="relative -mt-7 mb-4 w-fit">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-[18px] font-bold text-white shadow-sm overflow-hidden"
            style={{ background: avatarUrl ? undefined : "#5e6ad2", border: "3px solid white" }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarUrl("")} />
              : initials}
          </div>
          <button
            onClick={() => setShowAvatarInput((v) => !v)}
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-lx-faint shadow-sm transition-colors hover:text-lx-text"
            style={{ border: "1px solid #ebebeb" }}
            title="Change photo"
          >
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1.5l1.5 1.5-7 7H2v-1.5l7-7z" />
            </svg>
          </button>
        </div>

        {showAvatarInput && (
          <div className="mb-4 flex gap-1">
            <input
              autoFocus
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitAvatar(); if (e.key === "Escape") setShowAvatarInput(false); }}
              placeholder="Paste image URL…"
              className="flex-1 rounded-sm px-2 py-1 text-[11px] text-lx-text focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30"
              style={{ border: "1px solid #ebebeb" }}
            />
            <button onClick={commitAvatar} className="rounded-sm px-2 py-1 text-[11px] font-semibold text-white" style={{ background: "#5e6ad2" }}>Save</button>
          </div>
        )}

        {/* Display name */}
        <div className="mb-3">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onSave("displayName", name || null)}
            placeholder="Your name"
            className="w-full rounded-sm px-3 py-1.5 text-[13px] text-lx-text focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/20"
            style={{ border: "1px solid #ebebeb" }}
          />
        </div>

        {/* X / Twitter */}
        <div className="mb-3">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-lx-faint">X / Twitter</label>
          <div className="flex items-center gap-1 rounded-sm px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#5e6ad2]/20" style={{ border: "1px solid #ebebeb" }}>
            <span className="text-[13px] text-lx-faint">@</span>
            <input
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              onBlur={() => onSave("xHandle", xHandle || null)}
              placeholder="handle"
              className="flex-1 bg-transparent text-[13px] text-lx-text focus:outline-none"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-5">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
            Bio <span className="normal-case font-normal text-lx-faint">({bio.length}/160)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onBlur={() => onSave("bio", bio || null)}
            placeholder="Building in public…"
            maxLength={160}
            rows={3}
            className="w-full resize-none rounded-sm px-3 py-2 text-[12px] text-lx-text focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/20"
            style={{ border: "1px solid #ebebeb" }}
          />
        </div>

        {/* Preview */}
        <div className="rounded-sm p-3" style={{ background: "#f9f9f8", border: "1px solid #f0f0f0" }}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Public page preview</p>
          <div className="flex items-start gap-2.5">
            <div
              className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white overflow-hidden"
              style={{ background: avatarUrl ? undefined : "#5e6ad2" }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                : initials}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{name || "Your Name"}</p>
              {xHandle && <p className="text-[11px] text-[#a8a39b]">@{xHandle}</p>}
              {bio && <p className="mt-1 text-[11px] leading-relaxed text-[#6b6b6b] line-clamp-2">{bio}</p>}
            </div>
          </div>
        </div>

        {saving && ["displayName", "avatarUrl", "xHandle", "bio"].includes(saving) && (
          <p className="mt-3 text-center text-[11px] text-lx-faint">Saving…</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
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
