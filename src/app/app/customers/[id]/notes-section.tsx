"use client";
import { useEffect, useRef, useState } from "react";

interface Note {
  id: string;
  note: string;
  createdAt: string;
}

export function NotesSection({ customerId }: { customerId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/customers/${customerId}/notes`).then((r) => r.json()).then((rows: Note[]) => {
      if (Array.isArray(rows)) setNotes(rows);
    });
  }, [customerId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: text.trim() }),
    });
    if (res.ok) {
      const note: Note = await res.json();
      setNotes((n) => [note, ...n]);
      setText("");
    }
    setSaving(false);
  }

  async function deleteNote(noteId: string) {
    await fetch(`/api/customers/${customerId}/notes`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    setNotes((n) => n.filter((x) => x.id !== noteId));
  }

  return (
    <section className="rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Notes</p>

      <form onSubmit={submit} className="mb-5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note about this customer…"
          rows={2}
          className="w-full resize-none rounded-sm px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/25"
          style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e as unknown as React.FormEvent);
          }}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="rounded-sm px-3.5 py-1.5 text-[12px] font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ background: "#5e6ad2" }}
          >
            {saving ? "Saving…" : "Save note"}
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-[12px] text-lx-faint">No notes yet.</p>
      ) : (
        <div className="space-y-2.5">
          {notes.map((n) => (
            <div key={n.id} className="group relative rounded-sm p-3.5" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
              <p className="text-[13px] leading-relaxed text-lx-text" style={{ whiteSpace: "pre-wrap" }}>{n.note}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-lx-faint">
                  {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-[11px] text-lx-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#e3493c]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
