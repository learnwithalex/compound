"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ connectionId, label }: { connectionId: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function remove() {
    if (!confirm(`Remove "${label}"? All synced data will be deleted.`)) return;
    setBusy(true);
    const res = await fetch("/api/connections", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: connectionId }),
    });
    if (res.ok) router.refresh();
    else setBusy(false);
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); remove(); }}
      disabled={busy}
      title="Remove product"
      className="flex h-6 w-6 items-center justify-center rounded-sm bg-white text-lx-faint transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      style={{ border: "1px solid #ebebeb" }}
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}
