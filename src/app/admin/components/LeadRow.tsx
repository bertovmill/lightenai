"use client";

import { useState, useRef, useEffect } from "react";

export type LeadStatus = "lead" | "targeted" | "contacted";

export interface UnifiedLead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  profileUrl: string | null;
  message: string | null;
  date: string;
  source: "website" | "linkedin" | "x" | "medium" | "youtube" | "instagram" | "tiktok";
  status: LeadStatus;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-[#F5F4F0] text-[#666]" },
  targeted: { label: "Targeted", className: "bg-[#5F9468]/10 text-[#5F9468]" },
  contacted: { label: "Contacted", className: "bg-[#5F9468] text-white" },
};

const STATUS_ORDER: LeadStatus[] = ["lead", "targeted", "contacted"];

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  linkedin: "LinkedIn",
  x: "X",
  medium: "Medium",
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
};

interface LeadRowProps {
  lead: UnifiedLead;
  onStatusChange: (id: string, source: string, newStatus: LeadStatus) => void;
}

export default function LeadRow({ lead, onStatusChange }: LeadRowProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const config = STATUS_CONFIG[lead.status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="py-3 first:pt-0 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {lead.profileUrl ? (
              <a
                href={lead.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#5F9468] hover:underline font-medium truncate"
              >
                {lead.name}
              </a>
            ) : lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="text-sm text-[#5F9468] hover:underline font-medium truncate"
              >
                {lead.name}
              </a>
            ) : (
              <span className="text-sm font-medium text-[#1C1C1C] truncate">
                {lead.name}
              </span>
            )}
            {lead.company && (
              <span className="text-xs text-[#999]">{lead.company}</span>
            )}
          </div>
          {lead.message && (
            <p className="text-sm text-[#666] line-clamp-1">{lead.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#999]">{formatDate(lead.date)}</span>

          {/* Source badge */}
          <span className="text-[10px] font-medium text-[#999] bg-[#F5F4F0] px-1.5 py-0.5 rounded">
            {SOURCE_LABELS[lead.source] || lead.source}
          </span>

          {/* Status dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${config.className}`}
            >
              {config.label}
              <span className="ml-0.5 text-[9px]">{open ? "\u25B4" : "\u25BE"}</span>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E8E6E1] rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                {STATUS_ORDER.map((s) => {
                  const sc = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        onStatusChange(lead.id, lead.source, s);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#F5F4F0] transition-colors flex items-center gap-2 ${
                        lead.status === s ? "font-semibold" : ""
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${s === "lead" ? "bg-[#ccc]" : s === "targeted" ? "bg-[#5F9468]/50" : "bg-[#5F9468]"}`} />
                      {sc.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
