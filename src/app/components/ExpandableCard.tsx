"use client";

import { useState } from "react";

export function ExpandableCard({
  step,
  title,
  description,
  expandedText,
}: {
  step: string;
  title: string;
  description: string;
  expandedText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 h-full">
      <span className="text-[#5F9468] text-sm font-semibold tracking-[0.1em]">{step}</span>
      <h3 className="text-xl font-semibold mt-3 mb-3">{title}</h3>
      <p className="text-white/60 leading-relaxed text-sm">{description}</p>

      {expandedText && (
        <>
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-white/60 leading-relaxed text-sm">{expandedText}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F9468] uppercase tracking-[0.1em] hover:text-[#89B08F] transition-colors duration-200 cursor-pointer"
          >
            {isOpen ? "Read less" : "Read more"}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
