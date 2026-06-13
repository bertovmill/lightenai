"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  type OutreachSlot,
  type OutreachType,
  type OutreachCategory,
  type EngagementSlot,
} from "../hooks/useDailyProgress";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

interface SuggestedContact {
  name: string;
  email: string;
}

interface Step2OutreachProps {
  slots: [OutreachSlot, OutreachSlot, OutreachSlot, OutreachSlot, OutreachSlot];
  onUpdateSlot: (index: 0 | 1 | 2 | 3 | 4, slot: Partial<OutreachSlot>) => void;
  engagementSlots: [EngagementSlot, EngagementSlot, EngagementSlot];
  onUpdateEngagement: (index: 0 | 1 | 2, slot: Partial<EngagementSlot>) => void;
  suggestedContacts?: SuggestedContact[];
}

const TYPE_CONFIG: Record<Exclude<OutreachType, "">, { label: string; color: string; bg: string; border: string }> = {
  warm: { label: "Warm Lead", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  cold: { label: "Cold", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  referral: { label: "Referral", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

const CATEGORY_CONFIG: Record<OutreachCategory, {
  label: string;
  instruction: string;
  icon: string;
  optional?: boolean;
  sourceTag: string;
  searchQuery?: string;
  searchFilters?: string[];
}> = {
  notification: {
    label: "Notification Lead",
    instruction: "Check who liked/commented on your recent posts",
    icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    sourceTag: "daily_notification",
  },
  feed: {
    label: "Feed Find",
    instruction: "Find a potential client's post in your feed and engage",
    icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z",
    sourceTag: "daily_feed",
  },
  search: {
    label: "Search Find",
    instruction: "Paste the query below into LinkedIn People search, apply filters, and connect with someone",
    searchQuery: "Founder CEO Owner",
    searchFilters: [
      "Connections: 2nd + 3rd+ (prioritize 2nd — mutual connections = warm intro)",
      "Location: Greater Toronto Area, Canada",
      "Industry: Professional Services, Real Estate, Healthcare, or Legal",
      "Skip anyone already in tech/AI — they don't need you",
    ],
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    sourceTag: "daily_search",
  },
  inquiry: {
    label: "Inquiry Follow-up",
    instruction: "Follow up with a recent site inquiry on LinkedIn",
    icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    optional: true,
    sourceTag: "daily_inquiry",
  },
  reengage: {
    label: "Re-engage",
    instruction: "Message someone from your CRM who went quiet",
    icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
    optional: true,
    sourceTag: "daily_reengage",
  },
};

export default function Step2Outreach({
  slots,
  onUpdateSlot,
  engagementSlots,
  onUpdateEngagement,
  suggestedContacts,
}: Step2OutreachProps) {
  const doneCount = slots.filter((s) => s.done).length;
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);
  const [agentChatSlot, setAgentChatSlot] = useState<number | null>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);

  const persistToSupabase = (slot: OutreachSlot) => {
    const catConfig = CATEGORY_CONFIG[slot.category];
    fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: slot.name.trim(),
        type: slot.type || "cold",
        linkedin_url: slot.linkedinUrl || null,
        notes: slot.notes || null,
        outreach_date: new Date().toISOString().split("T")[0],
        source: catConfig.sourceTag,
      }),
    }).catch((err) => console.error("Failed to persist outreach:", err));
  };

  const handleToggleDone = (index: 0 | 1 | 2 | 3 | 4) => {
    const slot = slots[index];
    const markingDone = !slot.done;
    onUpdateSlot(index, { done: markingDone });
    if (markingDone && slot.name.trim()) {
      persistToSupabase(slot);
    }
  };

  const fillSuggestion = (index: 0 | 1 | 2 | 3 | 4, contact: SuggestedContact) => {
    onUpdateSlot(index, { name: `${contact.name} (${contact.email})`, type: "warm" });
  };

  const unusedSuggestions = suggestedContacts?.filter(
    (c) => !slots.some((s) => s.name.includes(c.email))
  );

  const hasSlotContext = (slot: OutreachSlot) =>
    !!(slot.name.trim() || slot.linkedinUrl.trim() || slot.notes.trim());

  const buildStarterPrompt = (slot: OutreachSlot) => {
    const catConfig = CATEGORY_CONFIG[slot.category];
    const parts: string[] = [];
    if (slot.name.trim()) {
      parts.push(`Draft a LinkedIn message for ${slot.name}`);
    } else if (slot.linkedinUrl.trim()) {
      parts.push(`Research this person and draft a LinkedIn message`);
    } else {
      parts.push(`Help me draft a LinkedIn outreach message`);
    }
    if (slot.type) parts.push(`(${slot.type} lead)`);
    if (slot.linkedinUrl) parts.push(`LinkedIn: ${slot.linkedinUrl}`);
    if (slot.notes) parts.push(`Context: ${slot.notes}`);
    parts.push(`Category: ${catConfig.label}`);
    return parts.join(". ");
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          {slots.map((s, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                s.done ? "bg-[#5F9468]" : "bg-[#E8E6E1]"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-[#999]">
          {doneCount}/5 done{doneCount < 3 && ` — need ${3 - doneCount} more`}
          {doneCount >= 3 && doneCount < 5 && " — step complete!"}
        </span>
      </div>

      {/* Outreach slots */}
      <div className="space-y-3">
        {slots.map((slot, i) => {
          const isExpanded = expandedSlot === i;
          const typeInfo = slot.type ? TYPE_CONFIG[slot.type] : null;
          const catConfig = CATEGORY_CONFIG[slot.category];
          const isInquirySlot = slot.category === "inquiry";

          return (
            <div key={i}>
              <div
                className={`rounded-xl border transition-colors duration-200 ${
                  slot.done
                    ? "bg-[#5F9468]/5 border-[#5F9468]/20"
                    : "bg-[#FAFAF8] border-[#E8E6E1]"
                }`}
              >
                {/* Category header */}
                <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                  <svg
                    className="w-3.5 h-3.5 text-[#5F9468]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={catConfig.icon} />
                  </svg>
                  <span className="text-[10px] font-semibold text-[#5F9468] uppercase tracking-wider">
                    {catConfig.label}
                  </span>
                  {catConfig.optional && (
                    <span className="text-[9px] text-[#999] uppercase tracking-wider">optional</span>
                  )}
                </div>

                {/* Copyable search query */}
                {catConfig.searchQuery && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(catConfig.searchQuery!);
                      setCopiedQuery(true);
                      setTimeout(() => setCopiedQuery(false), 2000);
                    }}
                    className="mx-3 mb-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-fit"
                    title="Copy search query"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {copiedQuery ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      )}
                    </svg>
                    <span className="font-mono">{catConfig.searchQuery}</span>
                    <span className="text-blue-400">{copiedQuery ? "Copied!" : "Copy"}</span>
                  </button>
                )}

                {/* Search filter tips */}
                {catConfig.searchFilters && !slot.done && (
                  <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#E8E6E1]">
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">Recommended filters</p>
                    <ul className="space-y-1">
                      {catConfig.searchFilters.map((filter, fi) => (
                        <li key={fi} className="flex items-start gap-1.5 text-xs text-[#666]">
                          <span className="text-[#5F9468] mt-0.5 shrink-0">&#8250;</span>
                          {filter}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Main row */}
                <div className="flex items-center gap-3 px-3 pb-3">
                  <button
                    onClick={() => handleToggleDone(i as 0 | 1 | 2 | 3 | 4)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      slot.done
                        ? "bg-[#5F9468] border-[#5F9468]"
                        : "border-[#D1CFC9] hover:border-[#5F9468]"
                    }`}
                  >
                    {slot.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder={catConfig.instruction}
                      value={slot.name}
                      onChange={(e) => onUpdateSlot(i as 0 | 1 | 2 | 3 | 4, { name: e.target.value })}
                      className={`w-full bg-transparent text-sm outline-none placeholder-[#999] ${
                        slot.done ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"
                      }`}
                    />
                  </div>

                  {typeInfo && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeInfo.color} ${typeInfo.bg} border ${typeInfo.border}`}>
                      {typeInfo.label}
                    </span>
                  )}

                  <button
                    onClick={() => setExpandedSlot(isExpanded ? null : i)}
                    className="text-[#999] hover:text-[#5F9468] transition-colors duration-200 shrink-0"
                    title="Details"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 space-y-3 border-t border-[#E8E6E1]/50 mt-0">
                    <div className="pt-3" />

                    {/* Type selector */}
                    <div>
                      <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-1.5">Type</p>
                      <div className="flex gap-2">
                        {(["warm", "cold", "referral"] as const).map((t) => {
                          const cfg = TYPE_CONFIG[t];
                          const isActive = slot.type === t;
                          return (
                            <button
                              key={t}
                              onClick={() => onUpdateSlot(i as 0 | 1 | 2 | 3 | 4, { type: isActive ? "" : t })}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors duration-200 ${
                                isActive
                                  ? `${cfg.color} ${cfg.bg} ${cfg.border}`
                                  : "text-[#999] border-[#E8E6E1] hover:border-[#D1CFC9]"
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* LinkedIn URL */}
                    <div>
                      <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-1.5">LinkedIn Profile</p>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <input
                          type="url"
                          placeholder="linkedin.com/in/their-profile"
                          value={slot.linkedinUrl || ""}
                          onChange={(e) => onUpdateSlot(i as 0 | 1 | 2 | 3 | 4, { linkedinUrl: e.target.value })}
                          className="flex-1 bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm outline-none placeholder-[#999] focus:border-[#5F9468] transition-colors duration-200"
                        />
                        {slot.linkedinUrl && (
                          <a
                            href={slot.linkedinUrl.startsWith("http") ? slot.linkedinUrl : `https://${slot.linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0A66C2] hover:text-[#004182] transition-colors duration-200"
                            title="Open profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Notes / Status */}
                    <div>
                      <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-1.5">Status / Notes</p>
                      <input
                        type="text"
                        placeholder="e.g., Sent connection request, DM'd intro, They replied..."
                        value={slot.notes || ""}
                        onChange={(e) => onUpdateSlot(i as 0 | 1 | 2 | 3 | 4, { notes: e.target.value })}
                        className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm outline-none placeholder-[#999] focus:border-[#5F9468] transition-colors duration-200"
                      />
                    </div>

                    {/* Draft with AI button */}
                    {hasSlotContext(slot) && (
                      <div className="pt-2 border-t border-[#E8E6E1]/50">
                        <button
                          onClick={() => setAgentChatSlot(i)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                          </svg>
                          Draft with AI
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Suggested contacts — inline under the inquiry slot */}
              {isInquirySlot && unusedSuggestions && unusedSuggestions.length > 0 && !slot.done && !slot.name && (
                <div className="mt-1.5 ml-8 mb-1">
                  <p className="text-[10px] text-[#999] mb-1">Recent inquiries:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unusedSuggestions.slice(0, 3).map((contact) => (
                      <button
                        key={contact.email}
                        onClick={() => fillSuggestion(i as 0 | 1 | 2 | 3 | 4, contact)}
                        className="px-2.5 py-1 rounded-lg border border-[#E8E6E1] text-[11px] text-[#666] hover:border-[#5F9468] hover:text-[#5F9468] transition-colors duration-200"
                      >
                        {contact.name || contact.email}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion messages */}
      {doneCount >= 3 && doneCount < 5 && (
        <div className="mt-4 py-3 text-center rounded-lg bg-[#5F9468]/5">
          <p className="text-sm text-[#5F9468] font-medium">
            {doneCount}/5 outreach done — step complete! Keep going for a perfect score.
          </p>
        </div>
      )}
      {doneCount === 5 && (
        <div className="mt-4 py-3 text-center rounded-lg bg-[#5F9468]/5">
          <p className="text-sm text-[#5F9468] font-medium">
            All 5 outreach done! Perfect score.
          </p>
        </div>
      )}

      {/* Engagement section */}
      <div className="mt-6 pt-5 border-t border-[#E8E6E1]">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-[#5F9468]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <h3 className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em]">
            Engage
          </h3>
          <span className="text-[10px] text-[#999]">
            Comment on 3 posts before you DM
          </span>
        </div>

        <div className="space-y-2">
          {engagementSlots.map((eSlot, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => onUpdateEngagement(i as 0 | 1 | 2, { done: !eSlot.done })}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                  eSlot.done
                    ? "bg-[#5F9468] border-[#5F9468]"
                    : "border-[#D1CFC9] hover:border-[#5F9468]"
                }`}
              >
                {eSlot.done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-[#999] shrink-0">Commented on</span>
              <input
                type="text"
                placeholder="whose post?"
                value={eSlot.targetName}
                onChange={(e) => onUpdateEngagement(i as 0 | 1 | 2, { targetName: e.target.value })}
                className={`flex-1 bg-transparent text-sm outline-none placeholder-[#999] border-b border-[#E8E6E1] focus:border-[#5F9468] pb-0.5 transition-colors duration-200 ${
                  eSlot.done ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen agent chat overlay */}
      {agentChatSlot !== null && (() => {
        const slot = slots[agentChatSlot];
        const catConfig = CATEGORY_CONFIG[slot.category];
        return (
          <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col">
            {/* Header bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E6E1] bg-white shrink-0">
              <button
                onClick={() => setAgentChatSlot(null)}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#1C1C1C] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#5F9468] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={catConfig.icon} />
                  </svg>
                  <span className="text-sm font-medium text-[#1C1C1C] truncate">
                    {slot.name.trim() || catConfig.label}
                  </span>
                  {slot.type && TYPE_CONFIG[slot.type] && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_CONFIG[slot.type].color} ${TYPE_CONFIG[slot.type].bg} border ${TYPE_CONFIG[slot.type].border}`}>
                      {TYPE_CONFIG[slot.type].label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat area — fills remaining height */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4">
              <AgentChat
                agentId="outreach"
                apiEndpoint="/api/agents/outreach"
                storageKey={`outreach-slot-${agentChatSlot}-${(slot.name.trim() || slot.linkedinUrl.trim() || slot.category).slice(0, 30)}`}
                placeholder="Tell me about this person and help me draft a message..."
                emptyStateTitle="Draft LinkedIn Message"
                emptyStateDescription="I'll research this person and help you craft the perfect outreach message."
                loadingText="Drafting..."
                agentIcon="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                agentName="Outreach Agent"
                variant="full"
                starterPrompts={[buildStarterPrompt(slot)]}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
