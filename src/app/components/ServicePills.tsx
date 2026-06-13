"use client";

import { useState, useRef, useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

type Service = "coaching" | "prototype" | "advisory";

const SERVICES: {
  id: Service;
  label: string;
  description: string;
  placeholder: string;
  submitLabel: string;
  apiService: string;
}[] = [
  {
    id: "coaching",
    label: "Free AI Coaching Session",
    description:
      "A 1-on-1 session to identify where AI fits into your workflow and what to prioritize first.",
    placeholder: "",
    submitLabel: "",
    apiService: "AI Coaching",
  },
  {
    id: "prototype",
    label: "Free Rapid AI Prototype",
    description:
      "We design and build a working AI prototype for your business in days, not months.",
    placeholder: "Your email — we'll scope it out",
    submitLabel: "Send",
    apiService: "AI Rapid Prototype",
  },
  {
    id: "advisory",
    label: "Free AI Strategy Call",
    description:
      "Ongoing strategic guidance to build your AI roadmap and stay ahead of the curve.",
    placeholder: "Your email for a free intro call",
    submitLabel: "Book",
    apiService: "AI Strategic Advisory",
  },
];

const CAL_LINK = "bertovmill/intro-call";
const CAL_NS = "intro-call";

function CalInlineEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: CAL_NS });
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: true,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#5F9468" },
          dark: { "cal-brand": "#5F9468" },
        },
      });
    })();
  }, []);

  return (
    <Cal
      namespace={CAL_NS}
      calLink={CAL_LINK}
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      config={{ layout: "month_view", theme: "light" }}
    />
  );
}

export function ServicePills() {
  const [active, setActive] = useState<Service | null>(null);
  const [email, setEmail] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && active !== "coaching" && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [active]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !active) return;
    if (active === "prototype" && projectDesc.length < 50) return;

    const service = SERVICES.find((s) => s.id === active);
    if (!service) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: "",
          last_name: "",
          company: "",
          role: "",
          company_size: "",
          project_budget: "",
          services: service.apiService,
          website: active === "prototype" ? linkedin : "",
          message: active === "prototype"
            ? `Rapid Prototype request: ${projectDesc}`
            : `Quick inquiry via hero: ${service.label}`,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    setActive(null);
    setEmail("");
    setProjectDesc("");
    setLinkedin("");
    setStatus("idle");
  };

  const pillClass = (id: Service) =>
    `text-center px-8 py-3.5 rounded-full border text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
      active === id
        ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
        : "bg-white border-[#d5d3cd] text-[#1C1C1C] hover:border-[#1C1C1C]/40 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
    }`;

  // ── Sent state (for email services) ──
  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#5F9468] flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-[#1C1C1C] font-medium">
            You&apos;re all set — we&apos;ll be in touch.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* ── Pills row ── */}
      <div className="flex flex-wrap justify-center gap-3">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(active === s.id ? null : s.id)}
            className={pillClass(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Description text ── */}
      {active && (
        <p
          className="text-sm text-[#666] mt-4 text-center max-w-md mx-auto"
          style={{ animation: "fadeSlideDown 0.2s ease-out" }}
        >
          {SERVICES.find((s) => s.id === active)?.description}
        </p>
      )}

      {/* ── Expanded content below pills ── */}
      {active && (
        <div
          className="w-full mt-5"
          style={{ animation: "fadeSlideDown 0.25s ease-out" }}
        >
          {active === "coaching" || active === "advisory" ? (
            /* ── Cal.com inline embed ── */
            <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] max-w-sm mx-auto" style={{ height: "650px" }}>
              <CalInlineEmbed />
            </div>
          ) : active === "prototype" ? (
            /* ── Prototype: email + description form ── */
            <div className="flex justify-center px-4">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white border border-[#E8E6E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-3"
              >
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full py-2.5 px-4 bg-[#F5F4F1] text-sm text-[#1C1C1C] placeholder-[#aaa] rounded-full border border-[#E8E6E1] focus:outline-none focus:border-[#5F9468]"
                />
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL (optional)"
                  className="w-full py-2.5 px-4 bg-[#F5F4F1] text-sm text-[#1C1C1C] placeholder-[#aaa] rounded-full border border-[#E8E6E1] focus:outline-none focus:border-[#5F9468]"
                />
                <textarea
                  required
                  minLength={50}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Describe what you want to build (min 50 characters)"
                  rows={3}
                  className="w-full py-2.5 px-4 bg-[#F5F4F1] text-sm text-[#1C1C1C] placeholder-[#aaa] rounded-xl border border-[#E8E6E1] focus:outline-none focus:border-[#5F9468] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#aaa]">
                    {projectDesc.length}/50 characters
                  </span>
                  <button
                    type="submit"
                    disabled={status === "sending" || !email || projectDesc.length < 50}
                    className="px-6 py-2.5 bg-[#1C1C1C] text-white text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#333] disabled:opacity-40 transition-all duration-200 cursor-pointer"
                  >
                    {status === "sending" ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Close */}
          <button
            onClick={handleClose}
            className="mx-auto mt-3 flex items-center gap-1.5 text-xs text-[#999] hover:text-[#666] transition-colors cursor-pointer"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
