"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdminEmail } from "@/lib/admin";

export function DropContentIdeas() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const visible = isAdminEmail(user?.primaryEmailAddress?.emailAddress);
  if (!visible) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/content-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTitle("");
    setDescription("");
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#5F9468] hover:bg-[#4F8357] text-white text-sm font-semibold tracking-[0.1em] uppercase px-6 py-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        DROP CONTENT IDEA
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1C1C1C]">Drop a content idea</h3>
              <button onClick={() => setOpen(false)} className="text-[#999] hover:text-[#1C1C1C] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {saved ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-[#5F9468]/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-[#5F9468] font-semibold">Saved!</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Idea title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSave()}
                  autoFocus
                  className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors mb-3"
                />
                <textarea
                  placeholder="Notes (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors mb-4 resize-none"
                />
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="w-full bg-[#5F9468] hover:bg-[#4F8357] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-full transition-colors duration-200"
                >
                  {saving ? "SAVING..." : "DROP IT"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
