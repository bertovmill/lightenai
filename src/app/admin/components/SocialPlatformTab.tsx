"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface SocialLead {
  id: string;
  platform: string;
  contact_name: string;
  profile_url: string | null;
  message_summary: string | null;
  lead_date: string;
  created_at: string;
}

interface SocialPlatformTabProps {
  platform: string;
  onCountChange?: (count: number) => void;
}

export default function SocialPlatformTab({ platform, onCountChange }: SocialPlatformTabProps) {
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [messageSummary, setMessageSummary] = useState("");

  // Stable ref for callback to avoid re-fetch loops
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`/api/social-leads?platform=${platform}`);
      const json = await res.json();
      const data: SocialLead[] = json.data || [];
      setLeads(data);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const recentCount = data.filter((l) => l.lead_date >= yesterdayStr).length;
      onCountChangeRef.current?.(recentCount);
    } catch (error) {
      console.error("Fetch social leads error:", error);
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    setLoading(true);
    fetchLeads();
  }, [fetchLeads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/social-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          contact_name: name.trim(),
          profile_url: profileUrl.trim() || null,
          message_summary: messageSummary.trim() || null,
        }),
      });

      if (res.ok) {
        setName("");
        setProfileUrl("");
        setMessageSummary("");
        await fetchLeads();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/social-leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await fetchLeads();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const recentLeads = leads.slice(0, 10);

  return (
    <div>
      {/* Quick-log form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Contact name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E6E1] bg-white text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
        />
        <input
          type="url"
          placeholder="Profile URL"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E6E1] bg-white text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
        />
        <textarea
          placeholder="Message / note"
          value={messageSummary}
          onChange={(e) => setMessageSummary(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E6E1] bg-white text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="px-4 py-2 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Logging..." : "Log Lead"}
        </button>
      </form>

      {/* Lead list */}
      {loading ? (
        <div className="py-6 flex justify-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      ) : recentLeads.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-[#999]">No leads logged yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0EFEC]">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="py-3 first:pt-0 group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {lead.profile_url ? (
                      <a
                        href={lead.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#5F9468] hover:underline font-medium truncate"
                      >
                        {lead.contact_name}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-[#1C1C1C] truncate">
                        {lead.contact_name}
                      </span>
                    )}
                    <span className="text-[11px] text-[#999] shrink-0">
                      {formatDate(lead.created_at)}
                    </span>
                  </div>
                  {lead.message_summary && (
                    <p className="text-sm text-[#666] line-clamp-2">
                      {lead.message_summary}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(lead.id)}
                  className="p-1 text-[#999] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Delete lead"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {leads.length > 10 && (
        <p className="text-xs text-[#999] mt-3">
          +{leads.length - 10} more leads
        </p>
      )}
    </div>
  );
}
