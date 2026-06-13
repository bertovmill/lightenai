"use client";

import { useRef, useEffect, useState } from "react";

interface StepCardProps {
  stepNumber: number;
  label: string;
  title: string;
  timeEstimate: string;
  isComplete: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export default function StepCard({
  stepNumber,
  label,
  title,
  timeEstimate,
  isComplete,
  isExpanded,
  onToggle,
  badge,
  children,
}: StepCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded, children]);

  // Re-measure when inner content resizes (e.g. expanding a slot's details)
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !isExpanded) return;

    const observer = new ResizeObserver(() => {
      setContentHeight(el.scrollHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isExpanded]);

  return (
    <div className="relative group">
      {/* Card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isComplete
            ? "bg-gradient-to-br from-[#f7faf8] to-[#f0f5f1] shadow-[0_1px_3px_rgba(107,143,113,0.08),0_4px_12px_rgba(107,143,113,0.04)]"
            : isExpanded
              ? "bg-white shadow-[0_2px_8px_rgba(28,28,28,0.06),0_8px_24px_rgba(28,28,28,0.04)]"
              : "bg-white shadow-[0_1px_2px_rgba(28,28,28,0.04),0_2px_8px_rgba(28,28,28,0.02)] hover:shadow-[0_2px_8px_rgba(28,28,28,0.06),0_8px_24px_rgba(28,28,28,0.04)]"
          }
          ${isExpanded ? "ring-1 ring-[#E8E6E1]/60" : "ring-1 ring-[#E8E6E1]/40 hover:ring-[#E8E6E1]/80"}
        `}
      >
        {/* Completion accent — left edge glow */}
        {isComplete && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#5F9468] via-[#5F9468] to-[#4F8357]" />
        )}

        {/* Header button */}
        <button
          onClick={onToggle}
          className={`
            w-full px-5 py-4 flex items-center gap-4
            transition-colors duration-200
            ${isComplete ? "pl-6" : ""}
          `}
        >
          {/* Step indicator */}
          <div className="relative shrink-0">
            <div
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold
                transition-all duration-500
                ${isComplete
                  ? "bg-[#5F9468] text-white shadow-[0_2px_8px_rgba(107,143,113,0.3)]"
                  : isExpanded
                    ? "bg-[#1C1C1C] text-white shadow-[0_2px_6px_rgba(28,28,28,0.15)]"
                    : "bg-[#F5F4F1] text-[#888] group-hover:bg-[#EDECE8] group-hover:text-[#666]"
                }
              `}
            >
              {isComplete ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
          </div>

          {/* Label + Title */}
          <div className="flex-1 text-left min-w-0">
            <p className={`
              text-[10px] font-semibold uppercase tracking-[0.15em] mb-0.5
              transition-colors duration-300
              ${isComplete ? "text-[#5F9468]" : "text-[#999]"}
            `}>
              {label}
            </p>
            <h3 className={`
              text-[15px] font-semibold tracking-[-0.01em] truncate
              transition-colors duration-300
              ${isComplete ? "text-[#4a6b4f]" : "text-[#1C1C1C]"}
            `}>
              {title}
            </h3>
          </div>

          {/* Badge */}
          {badge && <div className="shrink-0">{badge}</div>}

          {/* Time estimate pill */}
          <span className={`
            text-[11px] font-medium shrink-0 px-2.5 py-1 rounded-full
            transition-all duration-300
            ${isComplete
              ? "bg-[#5F9468]/10 text-[#5F9468]"
              : "bg-[#F5F4F1] text-[#999] group-hover:bg-[#EDECE8]"
            }
          `}>
            {timeEstimate}
          </span>

          {/* Expand chevron */}
          <div className={`
            shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
            transition-all duration-300
            ${isExpanded
              ? "bg-[#F5F4F1] rotate-180"
              : "bg-transparent group-hover:bg-[#F5F4F1]"
            }
          `}>
            <svg
              className="w-4 h-4 text-[#999]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expandable content */}
        <div
          style={{ maxHeight: isExpanded ? contentHeight : 0 }}
          className="transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden"
        >
          {/* Divider */}
          <div className="mx-5">
            <div className="h-px bg-gradient-to-r from-transparent via-[#E8E6E1] to-transparent" />
          </div>
          <div ref={contentRef} className="px-5 pb-5 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
