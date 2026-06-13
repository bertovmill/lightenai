"use client";

import { useState } from "react";

const STEPS = [
  {
    step: "01",
    title: "Interview",
    subtitle: "Sit down with your AI advisor",
    bullets: [
      "Identify where you\u2019re bleeding time",
      "Uncover where you\u2019re missing revenue",
      "Surface what\u2019s keeping you up at night",
      "See where competitors are beating you",
    ],
  },
  {
    step: "02",
    title: "Assessment",
    subtitle: "Map the gaps to real dollars",
    bullets: [
      "Audit your sales, marketing, ops, and CX workflows",
      "Put a cost on every inefficiency",
      "Rank opportunities by ROI potential",
      "Deliver a clear, prioritized action plan",
    ],
  },
  {
    step: "03",
    title: "Roadmap",
    subtitle: "Your path from today to AI-powered",
    bullets: [
      "Custom implementation timeline",
      "Quick wins you can act on immediately",
      "Long-term AI strategy for compounding gains",
      "Measurable targets so you know it\u2019s working",
    ],
  },
];

export function AssessmentFramework() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#5F9468] uppercase tracking-[0.1em] hover:text-[#4F8357] transition-colors duration-200 cursor-pointer py-2"
      >
        How the assessment works
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-400 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-[#E8E6E1] rounded-2xl p-6"
              >
                <span className="text-[#5F9468] text-xs font-semibold tracking-[0.1em]">
                  {step.step}
                </span>
                <h4 className="text-lg font-semibold mt-2 mb-1">{step.title}</h4>
                <p className="text-[#888] text-sm mb-4">{step.subtitle}</p>
                <ul className="space-y-2">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-[#555] leading-relaxed">
                      <svg className="w-4 h-4 text-[#5F9468] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
