"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import LeadRow, { UnifiedLead, LeadStatus } from "./LeadRow";

const CHANNELS = [
  { key: "all", label: "All" },
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X" },
  { key: "medium", label: "Medium" },
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "lead", label: "Lead", dot: "bg-[#ccc]" },
  { key: "targeted", label: "Targeted", dot: "bg-[#5F9468]/50" },
  { key: "contacted", label: "Contacted", dot: "bg-[#5F9468]" },
] as const;

type StatusFilterKey = (typeof STATUS_FILTERS)[number]["key"];

const SOCIAL_PLATFORMS = ["linkedin", "x", "medium", "youtube", "instagram", "tiktok"];

interface Step1LeadsProps {
  onComplete: () => void;
  isComplete: boolean;
  onNewCount?: (count: number) => void;
}

export default function Step1Leads({ onComplete, isComplete, onNewCount }: Step1LeadsProps) {
  const [activeChannel, setActiveChannel] = useState<ChannelKey>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("all");
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick-log form state (social tabs only)
  const [logName, setLogName] = useState("");
  const [logUrl, setLogUrl] = useState("");
  const [logNote, setLogNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onNewCountRef = useRef(onNewCount);
  onNewCountRef.current = onNewCount;

  const fetchAllLeads = useCallback(async () => {
    setLoading(true);
    try {
      const [inquiriesRes, socialRes] = await Promise.all([
        fetch("/api/inquiries"),
        fetch("/api/social-leads"),
      ]);

      const inquiriesJson = await inquiriesRes.json();
      const socialJson = await socialRes.json();

      const inquiries: UnifiedLead[] = (inquiriesJson.data || []).map((i: Record<string, string | null>) => ({
        id: i.id,
        name: i.first_name && i.last_name ? `${i.first_name} ${i.last_name}` : i.email || "Unknown",
        company: i.company,
        email: i.email,
        profileUrl: null,
        message: i.message,
        date: i.created_at || new Date().toISOString(),
        source: "website" as const,
        status: (i.status || "lead") as LeadStatus,
      }));

      const social: UnifiedLead[] = (socialJson.data || []).map((s: Record<string, string | null>) => ({
        id: s.id,
        name: s.contact_name || "Unknown",
        company: null,
        email: null,
        profileUrl: s.profile_url,
        message: s.message_summary,
        date: s.created_at || new Date().toISOString(),
        source: s.platform as UnifiedLead["source"],
        status: (s.status || "lead") as LeadStatus,
      }));

      const all = [...inquiries, ...social].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLeads(all);

      // Report count of recent leads (last 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newCount = all.filter((l) => new Date(l.date) > yesterday).length;
      onNewCountRef.current?.(newCount);
    } catch (error) {
      console.error("Fetch leads error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  const handleStatusChange = async (id: string, source: string, newStatus: LeadStatus) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    const endpoint = source === "website" ? "/api/inquiries" : "/api/social-leads";
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        // Revert on error
        fetchAllLeads();
      }
    } catch {
      fetchAllLeads();
    }
  };

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logName.trim() || activeChannel === "all" || activeChannel === "website") return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/social-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: activeChannel,
          contact_name: logName.trim(),
          profile_url: logUrl.trim() || null,
          message_summary: logNote.trim() || null,
        }),
      });

      if (res.ok) {
        setLogName("");
        setLogUrl("");
        setLogNote("");
        await fetchAllLeads();
      }
    } catch (error) {
      console.error("Quick log error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter leads
  const filtered = leads.filter((l) => {
    if (activeChannel !== "all" && l.source !== activeChannel) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  // Count per channel (for badges)
  const channelCounts: Record<string, number> = {};
  for (const l of leads) {
    channelCounts[l.source] = (channelCounts[l.source] || 0) + 1;
  }
  channelCounts["all"] = leads.length;

  // Count per status (for current channel)
  const channelLeads = activeChannel === "all" ? leads : leads.filter((l) => l.source === activeChannel);
  const statusCounts: Record<string, number> = { all: channelLeads.length };
  for (const l of channelLeads) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  }

  const showQuickLog = SOCIAL_PLATFORMS.includes(activeChannel);

  return (
    <div>
      {/* Channel tabs */}
      <div className="flex gap-1 overflow-x-auto pb-3 mb-3 -mx-1 px-1 scrollbar-hide">
        {CHANNELS.map((ch) => {
          const count = channelCounts[ch.key] || 0;
          const isActive = activeChannel === ch.key;
          return (
            <button
              key={ch.key}
              onClick={() => setActiveChannel(ch.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? "bg-[#5F9468] text-white"
                  : "bg-[#F5F4F0] text-[#666] hover:bg-[#ECEAE5] hover:text-[#1C1C1C]"
              }`}
            >
              {ch.label}
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#5F9468]/10 text-[#5F9468]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 mb-4">
        {STATUS_FILTERS.map((sf) => {
          const count = statusCounts[sf.key] || 0;
          const isActive = statusFilter === sf.key;
          return (
            <button
              key={sf.key}
              onClick={() => setStatusFilter(sf.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-[#1C1C1C] text-white"
                  : "bg-[#F5F4F0] text-[#666] hover:bg-[#ECEAE5]"
              }`}
            >
              {"dot" in sf && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : sf.dot}`} />
              )}
              {sf.label}
              {count > 0 && (
                <span className={`text-[10px] ${isActive ? "text-white/60" : "text-[#999]"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lead list */}
      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-[#5F9468]/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#1C1C1C] mb-1">No leads found</p>
          <p className="text-xs text-[#999]">
            {statusFilter !== "all"
              ? `No ${statusFilter} leads in this channel`
              : "No leads in this channel yet"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0EFEC]">
          {filtered.map((lead) => (
            <LeadRow
              key={`${lead.source}-${lead.id}`}
              lead={lead}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Quick-log form for social channels */}
      {showQuickLog && (
        <form onSubmit={handleQuickLog} className="mt-4 pt-4 border-t border-[#F0EFEC] space-y-2">
          <p className="text-[11px] font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-2">
            Quick Log — {CHANNELS.find((c) => c.key === activeChannel)?.label}
          </p>
          <input
            type="text"
            placeholder="Contact name *"
            value={logName}
            onChange={(e) => setLogName(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E6E1] bg-white text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Profile URL"
              value={logUrl}
              onChange={(e) => setLogUrl(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E8E6E1] bg-white text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
            />
            <input
              type="text"
              placeholder="Note"
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E8E6E1] bg-white text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !logName.trim()}
            className="px-4 py-2 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging..." : "Log Lead"}
          </button>
        </form>
      )}

      {/* Mark Reviewed */}
      {!isComplete && (
        <button
          onClick={onComplete}
          className="mt-4 w-full px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
        >
          Mark Reviewed
        </button>
      )}
    </div>
  );
}
