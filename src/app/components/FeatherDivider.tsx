"use client";

import { useEffect, useState } from "react";

/**
 * A section divider with a feather that bobs gently along the line.
 * The feather sits in the center and floats, reinforcing the "lighter" brand.
 */
export function FeatherDivider() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setVisible(false);
    const handler = (e: MediaQueryListEvent) => setVisible(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 py-4" aria-hidden="true">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#5F9468]/20 to-[#5F9468]/20" />
      <div className={visible ? "animate-feather-bob" : ""}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-30"
        >
          <path
            d="M21 3C17 3 13 7 10 12C7 17 6 21 6 25L8 23C9 20 11 16 14 12C17 8 20 6 23 6L21 3Z"
            fill="#5F9468"
          />
          <path
            d="M6 25C6 25 8 24 11 21C14 18 17 14 19 10C21 6 21 3 21 3"
            stroke="#5F9468"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 25L14 17"
            stroke="#5F9468"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#5F9468]/20 to-[#5F9468]/20" />
    </div>
  );
}
