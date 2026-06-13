"use client";

import { useEffect, useState } from "react";

export function HeroGlow() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setVisible(false);
    const handler = (e: MediaQueryListEvent) => setVisible(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Green orb */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#5F9468] opacity-[0.08] blur-[100px] animate-hero-float" />
      {/* Coral orb */}
      <div
        className="absolute top-40 -right-24 w-[400px] h-[400px] rounded-full bg-[#E8856C] opacity-[0.06] blur-[100px] animate-hero-float"
        style={{ animationDelay: "-4s" }}
      />
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern
            id="hero-dots"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>
    </div>
  );
}
