"use client";

import { useState, useRef } from "react";

const CATEGORIES = [
  { value: "improvement", label: "Improvement" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("improvement");
  const [email, setEmail] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorDetail("Please attach a PNG, JPEG, or WebP image.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorDetail("Screenshot must be under 5MB.");
      setStatus("error");
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    if (status === "error") setStatus("idle");
  };

  const removeScreenshot = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleFileSelect(file);
        return;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");

    try {
      const formData = new FormData();
      formData.append("message", message.trim());
      formData.append("category", category);
      formData.append("page_url", window.location.href);
      if (email) formData.append("email", email);
      if (screenshot) formData.append("screenshot", screenshot);

      const res = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body ? JSON.stringify(body) : `HTTP ${res.status}`
        );
      }

      setStatus("success");
      setMessage("");
      setEmail("");
      setCategory("improvement");
      removeScreenshot();
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
      }, 2000);
    } catch (err) {
      setErrorDetail(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-[#5F9468] text-white shadow-lg shadow-[#5F9468]/25 hover:bg-[#4F8357] transition-all duration-200 flex items-center justify-center"
        aria-label="Send feedback"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </button>

      {/* Form panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 bg-white border border-[#E8E6E1] rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="px-4 py-3 border-b border-[#E8E6E1]">
            <h3 className="text-sm font-semibold text-[#1C1C1C]">Send Feedback</h3>
            <p className="text-xs text-[#999] mt-0.5">Help us improve the website</p>
          </div>

          {status === "success" ? (
            <div className="px-4 py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#5F9468]/10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1C1C1C]">Thanks for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} onPaste={handlePaste} className="p-4 space-y-3">
              {/* Category */}
              <div>
                <label className="text-xs font-medium text-[#666] mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E8E6E1] text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#5F9468] transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-medium text-[#666] mb-1 block">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What could we do better?"
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E6E1] text-sm text-[#1C1C1C] placeholder:text-[#CCC] resize-none focus:outline-none focus:border-[#5F9468] transition-colors"
                />
              </div>

              {/* Screenshot attachment */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                />
                {screenshotPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="h-16 w-auto rounded-lg border border-[#E8E6E1] object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                      aria-label="Remove screenshot"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#5F9468] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    Attach screenshot
                  </button>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-[#666] mb-1 block">
                  Email <span className="text-[#CCC]">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E8E6E1] text-sm text-[#1C1C1C] placeholder:text-[#CCC] focus:outline-none focus:border-[#5F9468] transition-colors"
                />
              </div>

              {status === "error" && (
                <div className="text-xs text-red-500 space-y-1">
                  <p>Something went wrong. Please try again.</p>
                  {errorDetail && (
                    <pre className="bg-red-50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-[10px] text-red-600 max-h-24 overflow-y-auto">
                      {errorDetail}
                    </pre>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!message.trim() || status === "sending"}
                className="w-full px-4 py-2 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {status === "sending" ? "Sending..." : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
