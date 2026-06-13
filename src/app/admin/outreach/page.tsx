"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

type OutreachType = "warm" | "cold" | "referral";
type OutreachStatus = "contacted" | "replied" | "meeting" | "converted" | "not_interested";

interface OutreachContact {
  id: string;
  created_at: string;
  outreach_date: string;
  name: string;
  type: OutreachType;
  linkedin_url: string | null;
  notes: string | null;
  status: OutreachStatus;
  source: string | null;
}

const TYPE_CONFIG: Record<OutreachType, { label: string; color: string; bg: string; border: string }> = {
  warm: { label: "Warm Lead", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  cold: { label: "Cold", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  referral: { label: "Referral", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string; bg: string }> = {
  contacted: { label: "Contacted", color: "text-[#666]", bg: "bg-[#F5F4F1]" },
  replied: { label: "Replied", color: "text-blue-700", bg: "bg-blue-50" },
  meeting: { label: "Meeting", color: "text-amber-700", bg: "bg-amber-50" },
  converted: { label: "Converted", color: "text-green-700", bg: "bg-green-50" },
  not_interested: { label: "Not Interested", color: "text-red-600", bg: "bg-red-50" },
};

const ALL_STATUSES: OutreachStatus[] = ["contacted", "replied", "meeting", "converted", "not_interested"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function OutreachCRMPage() {
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<OutreachType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<OutreachStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterStatus !== "all") params.set("status", filterStatus);

      const res = await fetch(`/api/outreach?${params}`);
      const json = await res.json();
      if (json.data) setContacts(json.data);
    } catch (err) {
      console.error("Failed to fetch outreach contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateContactStatus = async (id: string, status: OutreachStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
      }
    } catch (err) {
      console.error("Failed to update contact:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateContactNotes = async (id: string, notes: string) => {
    try {
      await fetch("/api/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, notes } : c))
      );
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  // Client-side search filter
  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.notes?.toLowerCase().includes(q) ?? false)
    );
  });

  // Stats
  const total = contacts.length;
  const thisWeek = contacts.filter((c) => isThisWeek(c.outreach_date)).length;
  const thisMonth = contacts.filter((c) => isThisMonth(c.outreach_date)).length;
  const converted = contacts.filter((c) => c.status === "converted").length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(0) : "0";

  const typeBreakdown = {
    warm: contacts.filter((c) => c.type === "warm").length,
    cold: contacts.filter((c) => c.type === "cold").length,
    referral: contacts.filter((c) => c.type === "referral").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Outreach CRM</h1>
        <p className="text-sm text-[#999] mt-1">Track contacts and conversions over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#1C1C1C]">{total}</p>
          <p className="text-xs text-[#999] mt-1">Total Contacts</p>
        </div>
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#1C1C1C]">{thisWeek}</p>
          <p className="text-xs text-[#999] mt-1">This Week</p>
        </div>
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#1C1C1C]">{thisMonth}</p>
          <p className="text-xs text-[#999] mt-1">This Month</p>
        </div>
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#5F9468]">{conversionRate}%</p>
          <p className="text-xs text-[#999] mt-1">Conversion Rate</p>
        </div>
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-4">
          <div className="flex gap-3 text-xs">
            <span className="text-amber-700">{typeBreakdown.warm} warm</span>
            <span className="text-blue-700">{typeBreakdown.cold} cold</span>
            <span className="text-purple-700">{typeBreakdown.referral} ref</span>
          </div>
          <p className="text-xs text-[#999] mt-1">By Type</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Type filter */}
        <div className="flex gap-1.5">
          {(["all", "warm", "cold", "referral"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 ${
                filterType === t
                  ? t === "all"
                    ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
                    : `${TYPE_CONFIG[t].color} ${TYPE_CONFIG[t].bg} ${TYPE_CONFIG[t].border}`
                  : "text-[#999] border-[#E8E6E1] hover:border-[#D1CFC9]"
              }`}
            >
              {t === "all" ? "All Types" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 ${
              filterStatus === "all"
                ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
                : "text-[#999] border-[#E8E6E1] hover:border-[#D1CFC9]"
            }`}
          >
            All Status
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 ${
                filterStatus === s
                  ? `${STATUS_CONFIG[s].color} ${STATUS_CONFIG[s].bg} border-current`
                  : "text-[#999] border-[#E8E6E1] hover:border-[#D1CFC9]"
              }`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="sm:ml-auto">
          <input
            type="text"
            placeholder="Search name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm outline-none placeholder-[#999] focus:border-[#5F9468] transition-colors duration-200"
          />
        </div>
      </div>

      {/* Contact List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 text-[#E8E6E1] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-[#999] text-sm">
            {contacts.length === 0
              ? "No outreach contacts yet. Mark outreach as done on your dashboard to start tracking."
              : "No contacts match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact) => {
            const typeInfo = TYPE_CONFIG[contact.type];
            const statusInfo = STATUS_CONFIG[contact.status];
            const isExpanded = expandedId === contact.id;

            return (
              <div
                key={contact.id}
                className="bg-white border border-[#E8E6E1] rounded-xl transition-colors duration-200 hover:border-[#D1CFC9]"
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                >
                  <span className="text-xs text-[#999] w-20 shrink-0">
                    {formatDate(contact.outreach_date)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#1C1C1C] truncate block">
                      {contact.name}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeInfo.color} ${typeInfo.bg} border ${typeInfo.border} shrink-0`}>
                    {typeInfo.label}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.color} ${statusInfo.bg} shrink-0`}>
                    {statusInfo.label}
                  </span>

                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url.startsWith("http") ? contact.linkedin_url : `https://${contact.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A66C2] hover:text-[#004182] transition-colors shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      title="LinkedIn profile"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}

                  <svg
                    className={`w-4 h-4 text-[#999] transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-[#E8E6E1]/50 space-y-4">
                    <div className="pt-3" />

                    {/* Status pipeline */}
                    <div>
                      <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-2">Pipeline Status</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_STATUSES.map((s) => {
                          const cfg = STATUS_CONFIG[s];
                          const isActive = contact.status === s;
                          const isUpdating = updatingId === contact.id;
                          return (
                            <button
                              key={s}
                              onClick={() => updateContactStatus(contact.id, s)}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 disabled:opacity-50 ${
                                isActive
                                  ? `${cfg.color} ${cfg.bg} border-current`
                                  : "text-[#999] border-[#E8E6E1] hover:border-[#D1CFC9]"
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-1.5">Notes</p>
                      <input
                        type="text"
                        placeholder="Add notes about this contact..."
                        defaultValue={contact.notes ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== (contact.notes ?? "")) {
                            updateContactNotes(contact.id, e.target.value);
                          }
                        }}
                        className="w-full bg-[#FAFAF8] border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm outline-none placeholder-[#999] focus:border-[#5F9468] transition-colors duration-200"
                      />
                    </div>

                    {/* AI Agent Chat */}
                    <div className="pt-2 border-t border-[#E8E6E1]/50">
                      <div className="rounded-lg border border-[#E8E6E1] overflow-hidden" style={{ height: "400px" }}>
                        <AgentChat
                          agentId="outreach"
                          apiEndpoint="/api/agents/outreach"
                          storageKey={`outreach-crm-${contact.id}`}
                          placeholder="Tell me about this person..."
                          emptyStateTitle="Draft LinkedIn Message"
                          emptyStateDescription="I'll research this person and help you craft the perfect outreach message."
                          loadingText="Drafting..."
                          agentIcon="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                          agentName="Outreach Agent"
                          variant="embedded"
                          starterPrompts={[
                            `Draft a LinkedIn message for ${contact.name} (${contact.type} lead)${contact.linkedin_url ? ` LinkedIn: ${contact.linkedin_url}` : ""}${contact.notes ? ` Notes: ${contact.notes}` : ""}`
                          ]}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex gap-4 text-[11px] text-[#999]">
                      {contact.source && <span>Source: {contact.source}</span>}
                      <span>Added: {new Date(contact.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
