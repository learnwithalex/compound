"use client";
import { useState } from "react";
import { productIcon } from "@/lib/format";

export function ProductSettingsTab({
  connectionId,
  label: initialLabel,
  websiteUrl: initialWebsiteUrl,
  iconUrl: initialIconUrl,
  provider,
}: {
  connectionId: string;
  label: string;
  websiteUrl: string | null;
  iconUrl: string | null;
  provider: string;
}) {
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl ?? "");
  const [iconUrl, setIconUrl] = useState(initialIconUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewIcon = productIcon(initialLabel, provider, websiteUrl || null, iconUrl || null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        websiteUrl: websiteUrl.trim() || null,
        iconUrl: iconUrl.trim() || null,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-md">
      <form onSubmit={save} className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Product logo</p>

        {/* Live preview */}
        <div className="mb-5 flex items-center gap-3">
          <img
            src={previewIcon}
            alt="logo preview"
            width={48} height={48}
            className="h-12 w-12 rounded-sm object-cover"
            style={{ border: "1px solid #ebebeb" }}
          />
          <div className="text-[12px] text-lx-muted">
            <p className="font-medium text-lx-text">{initialLabel}</p>
            <p className="capitalize">{provider}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
            Website URL
          </label>
          <input
            type="url"
            placeholder="https://yourproduct.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
            style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
          />
          <p className="mt-1 text-[11px] text-lx-faint">We&apos;ll fetch the favicon from your site automatically.</p>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
            Custom logo URL <span className="normal-case font-normal">(overrides favicon)</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            className="w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
            style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
          />
          <p className="mt-1 text-[11px] text-lx-faint">Paste a direct link to any image (PNG, SVG, JPG).</p>
        </div>

        {error && <p className="mb-3 text-[12px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-sm px-4 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          style={{ background: "#5e6ad2" }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
