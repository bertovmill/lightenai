"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

interface CustDevSlot {
  name: string;
  linkedinUrl: string;
  introSent: boolean;
  replied: boolean;
  meetingBooked: boolean;
  notes: string;
}

interface StepCustDevProps {
  onComplete: () => void;
  isComplete: boolean;
}

const HYPOTHESIS_STORAGE_KEY = "lighten-custdev-hypothesis";
const GOALS_STORAGE_KEY = "lighten-custdev-goals";

const DEFAULT_GOALS = [
  "What does the perfect customer look like?",
  "What pain points do they experience today?",
  "How do they cope with that pain today?",
  "How much would they pay to eliminate that pain?",
  "What triggers them to decide to buy?",
  "What causes them to resist or fear buying?",
  "Where do they go to discover products like this?",
  "What words do they use to talk about the space?",
];

function getEmptySlot(): CustDevSlot {
  return { name: "", linkedinUrl: "", introSent: false, replied: false, meetingBooked: false, notes: "" };
}

export default function StepCustDev({ onComplete, isComplete }: StepCustDevProps) {
  const [slots, setSlots] = useState<[CustDevSlot, CustDevSlot, CustDevSlot]>([
    getEmptySlot(),
    getEmptySlot(),
    getEmptySlot(),
  ]);
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"outreach" | "hypothesis">("outreach");
  const [hypothesis, setHypothesis] = useState("");
  const [goals, setGoals] = useState<string[]>(DEFAULT_GOALS);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [agentChatSlot, setAgentChatSlot] = useState<number | null>(null);
  const [showPrepPanel, setShowPrepPanel] = useState(false);
  const [inboxChecked, setInboxChecked] = useState(false);

  // Load inbox check + hypothesis & goals from localStorage
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const inboxSaved = localStorage.getItem("lighten-custdev-inbox");
      if (inboxSaved) {
        const parsed = JSON.parse(inboxSaved);
        if (parsed.date === today) setInboxChecked(parsed.checked);
      }
      const saved = localStorage.getItem(HYPOTHESIS_STORAGE_KEY);
      if (saved) setHypothesis(saved);
      const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (savedGoals) setGoals(JSON.parse(savedGoals));
    } catch { /* ignore */ }
  }, []);

  const toggleInbox = () => {
    const next = !inboxChecked;
    setInboxChecked(next);
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("lighten-custdev-inbox", JSON.stringify({ date: today, checked: next }));
  };

  // Save hypothesis
  useEffect(() => {
    if (hypothesis) {
      localStorage.setItem(HYPOTHESIS_STORAGE_KEY, hypothesis);
    }
  }, [hypothesis]);

  // Save goals
  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const updateSlot = (index: number, update: Partial<CustDevSlot>) => {
    setSlots((prev) => {
      const next = [...prev] as [CustDevSlot, CustDevSlot, CustDevSlot];
      next[index] = { ...next[index], ...update };
      return next;
    });
  };

  const sentCount = slots.filter((s) => s.introSent).length;

  const buildStarterPrompt = (slot: CustDevSlot) => {
    const parts: string[] = [];
    if (slot.name.trim()) {
      parts.push(`Draft a short, friendly LinkedIn intro message for ${slot.name}`);
    } else {
      parts.push("Help me draft a short, friendly LinkedIn intro message");
    }
    parts.push("The goal is to introduce myself and Lighten AI (we build custom AI agents for businesses) and ask if they'd be open to a quick meeting where I can explain what we do");
    parts.push("Keep it conversational and brief — not salesy. We're genuinely trying to learn about their business and see if AI agents could help");
    if (slot.linkedinUrl) parts.push(`LinkedIn: ${slot.linkedinUrl}`);
    if (slot.notes) parts.push(`Context: ${slot.notes}`);
    if (hypothesis) parts.push(`Current hypothesis I'm testing: ${hypothesis}`);
    return parts.join(". ");
  };

  const INTERVIEW_QUESTIONS = [
    { goal: "Perfect Customer", question: "When you meet someone new, how do you explain what your business does in a few sentences?" },
    { goal: "Daily Workflow", question: "Walk me through a typical day — what tools do you use, what takes up most of your time?" },
    { goal: "Pain Points", question: "What's the most frustrating or repetitive part of your work right now?" },
    { goal: "Current Solutions", question: "Have you ever tried to automate or outsource that? What happened?" },
    { goal: "Pricing", question: "How valuable is saving time on that? Have you ever spent money to improve it?" },
    { goal: "Triggers", question: "What would make you say 'today's the day I need to change how I do this'?" },
    { goal: "Objections", question: "What would make you hesitate about bringing in a new tool or service?" },
    { goal: "Discovery", question: "When you need a new tool or service for your business, where do you look first?" },
    { goal: "Language", question: "When you think about AI — what comes to mind? What excites or concerns you?" },
  ];

  return (
    <div>
      {/* Check Inbox */}
      <div className="flex items-center gap-3 px-3 py-2.5 mb-4 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8]">
        <button
          onClick={toggleInbox}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
            inboxChecked
              ? "bg-[#5F9468] border-[#5F9468]"
              : "border-[#D1CFC9] hover:border-[#5F9468]"
          }`}
        >
          {inboxChecked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${inboxChecked ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"}`}>
            Check inbox
          </span>
          <p className="text-xs text-[#999] mt-0.5">Review and respond to emails in Gmail</p>
        </div>
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#5F9468] hover:text-[#4F8357] font-medium transition-colors shrink-0"
        >
          Open Gmail
        </a>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 p-0.5 bg-[#F5F4F1] rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("outreach")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
            activeTab === "outreach"
              ? "bg-white text-[#1C1C1C] shadow-sm"
              : "text-[#999] hover:text-[#666]"
          }`}
        >
          Today&apos;s Outreach
        </button>
        <button
          onClick={() => setActiveTab("hypothesis")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
            activeTab === "hypothesis"
              ? "bg-white text-[#1C1C1C] shadow-sm"
              : "text-[#999] hover:text-[#666]"
          }`}
        >
          Hypothesis &amp; Goals
        </button>
      </div>

      {activeTab === "outreach" && (
        <div>
          {/* Current hypothesis banner */}
          {hypothesis && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Testing Today
              </p>
              <p className="text-sm text-amber-800">{hypothesis}</p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {slots.map((s, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    s.introSent ? "bg-[#5F9468]" : "bg-[#E8E6E1]"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[#999]">
              {sentCount}/3 intros sent
              {sentCount < 2 && ` — need ${2 - sentCount} more`}
              {sentCount >= 2 && sentCount < 3 && " — step complete!"}
              {sentCount === 3 && " — perfect!"}
            </span>
          </div>

          {/* Prepare Questions button */}
          <button
            onClick={() => setShowPrepPanel(!showPrepPanel)}
            className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8E6E1] text-xs font-medium text-[#666] hover:border-[#5F9468] hover:text-[#5F9468] transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            {showPrepPanel ? "Hide" : "Prepare"} Interview Questions
          </button>

          {/* Interview prep panel */}
          {showPrepPanel && (
            <div className="mb-4 p-4 rounded-xl border border-[#E8E6E1] bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em]">
                  Interview Script
                </h4>
                <button
                  onClick={() => {
                    const script = INTERVIEW_QUESTIONS.map((q) => `[${q.goal}]\n${q.question}`).join("\n\n");
                    navigator.clipboard.writeText(script);
                  }}
                  className="text-[10px] font-medium text-[#5F9468] hover:text-[#4F8357] transition-colors"
                >
                  Copy All
                </button>
              </div>
              <div className="space-y-3">
                {INTERVIEW_QUESTIONS.map((q, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-0.5">{q.goal}</p>
                    <p className="text-sm text-[#1C1C1C]">{q.question}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 pt-3 border-t border-[#E8E6E1] text-xs text-[#999]">
                ~25 min interview &middot; Listen more than you talk &middot; Follow surprises with &ldquo;tell me more about that&rdquo;
              </p>
            </div>
          )}

          {/* Outreach slots */}
          <div className="space-y-3">
            {slots.map((slot, i) => {
              const isExpanded = expandedSlot === i;

              return (
                <div key={i}>
                  <div
                    className={`rounded-xl border transition-colors duration-200 ${
                      slot.introSent
                        ? "bg-[#5F9468]/5 border-[#5F9468]/20"
                        : "bg-[#FAFAF8] border-[#E8E6E1]"
                    }`}
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                      <svg className="w-3.5 h-3.5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-[#5F9468] uppercase tracking-wider">
                        Lead {i + 1}
                      </span>
                      {slot.replied && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                          Replied
                        </span>
                      )}
                      {slot.meetingBooked && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium text-blue-700 bg-blue-50 border border-blue-200">
                          Meeting Booked
                        </span>
                      )}
                    </div>

                    {/* Main row */}
                    <div className="flex items-center gap-3 px-3 pb-3">
                      <button
                        onClick={() => updateSlot(i, { introSent: !slot.introSent })}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          slot.introSent
                            ? "bg-[#5F9468] border-[#5F9468]"
                            : "border-[#D1CFC9] hover:border-[#5F9468]"
                        }`}
                        title="Mark intro sent"
                      >
                        {slot.introSent && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          placeholder="Contact name — who are you reaching out to?"
                          value={slot.name}
                          onChange={(e) => updateSlot(i, { name: e.target.value })}
                          className={`w-full bg-transparent text-sm outline-none placeholder-[#999] ${
                            slot.introSent ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"
                          }`}
                        />
                      </div>

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
                      <div className="px-3 pb-3 pt-0 space-y-3 border-t border-[#E8E6E1]/50">
                        <div className="pt-3" />

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
                              value={slot.linkedinUrl}
                              onChange={(e) => updateSlot(i, { linkedinUrl: e.target.value })}
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

                        {/* Status checkboxes */}
                        <div>
                          <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-1.5">Progress</p>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slot.replied}
                                onChange={(e) => updateSlot(i, { replied: e.target.checked })}
                                className="w-3.5 h-3.5 rounded border-[#D1CFC9] text-[#5F9468] focus:ring-[#5F9468]"
                              />
                              <span className="text-xs text-[#666]">Replied</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slot.meetingBooked}
                                onChange={(e) => updateSlot(i, { meetingBooked: e.target.checked })}
                                className="w-3.5 h-3.5 rounded border-[#D1CFC9] text-[#5F9468] focus:ring-[#5F9468]"
                              />
                              <span className="text-xs text-[#666]">Meeting Booked</span>
                            </label>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-1.5">Notes</p>
                          <input
                            type="text"
                            placeholder="e.g., runs a law firm, met at networking event..."
                            value={slot.notes}
                            onChange={(e) => updateSlot(i, { notes: e.target.value })}
                            className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm outline-none placeholder-[#999] focus:border-[#5F9468] transition-colors duration-200"
                          />
                        </div>

                        {/* Draft with AI button */}
                        {(slot.name.trim() || slot.linkedinUrl.trim()) && (
                          <div className="pt-2 border-t border-[#E8E6E1]/50">
                            <button
                              onClick={() => setAgentChatSlot(i)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                              </svg>
                              Draft Intro Message with AI
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion state */}
          {sentCount >= 2 && (
            <div className="mt-4 py-3 text-center rounded-lg bg-[#5F9468]/5">
              <p className="text-sm text-[#5F9468] font-medium">
                {sentCount === 3 ? "All 3 intros sent! Great work." : `${sentCount}/3 intros sent — step complete! Send one more for a perfect score.`}
              </p>
            </div>
          )}

          {/* Mark complete button */}
          <div className="mt-4">
            <button
              onClick={onComplete}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isComplete
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/20"
                  : sentCount >= 2
                    ? "bg-[#5F9468] text-white hover:bg-[#4F8357]"
                    : "bg-[#F5F4F1] text-[#999] cursor-not-allowed"
              }`}
              disabled={!isComplete && sentCount < 2}
            >
              {isComplete ? "Completed — Undo" : "Mark Customer Dev Complete"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "hypothesis" && (
        <div className="space-y-5">
          {/* Current hypothesis */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <h4 className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em]">
                Current Hypothesis
              </h4>
            </div>
            <p className="text-xs text-[#999] mb-2">
              What do you believe about your customers right now? Write it as a prediction you can test.
            </p>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="e.g., Small professional services firms (5-20 employees) spend 10+ hours/week on repetitive admin tasks that could be automated with AI agents, and they'd pay $500-2000/month for a custom solution."
              rows={3}
              className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-2 text-sm outline-none placeholder-[#999] focus:border-[#5F9468] transition-colors duration-200 resize-none"
            />
          </div>

          {/* Learning goals */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              <h4 className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em]">
                Learning Goals
              </h4>
            </div>
            <p className="text-xs text-[#999] mb-2">
              What are you trying to learn? These drive your interview questions.
            </p>
            <div className="space-y-1.5">
              {goals.map((goal, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <span className="text-[#5F9468] text-xs mt-1.5 shrink-0 font-medium">G{i + 1}</span>
                  {editingGoal === i ? (
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => {
                        const next = [...goals];
                        next[i] = e.target.value;
                        setGoals(next);
                      }}
                      onBlur={() => setEditingGoal(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingGoal(null)}
                      autoFocus
                      className="flex-1 bg-white border border-[#5F9468] rounded px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingGoal(i)}
                      className="flex-1 text-left text-sm text-[#1C1C1C] hover:text-[#5F9468] py-1 transition-colors"
                    >
                      {goal}
                    </button>
                  )}
                  <button
                    onClick={() => setGoals(goals.filter((_, j) => j !== i))}
                    className="opacity-0 group-hover:opacity-100 text-[#999] hover:text-red-500 transition-all mt-1.5"
                    title="Remove goal"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setGoals([...goals, ""]);
                  setEditingGoal(goals.length);
                }}
                className="flex items-center gap-1.5 text-xs text-[#5F9468] hover:text-[#4F8357] font-medium mt-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Goal
              </button>
            </div>
          </div>

          {/* Method reminder */}
          <div className="p-3 rounded-lg bg-[#F5F4F1] border border-[#E8E6E1]">
            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">Iterative Hypothesis Method</p>
            <ul className="space-y-1 text-xs text-[#666]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#5F9468] mt-0.5 shrink-0">1.</span>
                Write your hypothesis — your best guess about your customers
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5F9468] mt-0.5 shrink-0">2.</span>
                Send intro messages and ask for a meeting
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5F9468] mt-0.5 shrink-0">3.</span>
                In meetings, ask open-ended questions — listen, don&apos;t sell
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5F9468] mt-0.5 shrink-0">4.</span>
                Update your hypothesis based on what you learn
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5F9468] mt-0.5 shrink-0">5.</span>
                Stop when surprises stop — that&apos;s your signal
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Full-screen agent chat overlay */}
      {agentChatSlot !== null && (() => {
        const slot = slots[agentChatSlot];
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-sm font-medium text-[#1C1C1C] truncate">
                    {slot.name.trim() || "Draft Intro Message"}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4">
              <AgentChat
                agentId="outreach"
                apiEndpoint="/api/agents/outreach"
                storageKey={`custdev-intro-${agentChatSlot}-${(slot.name.trim() || "new").slice(0, 30)}`}
                placeholder="Tell me about this person and help me draft an intro message..."
                emptyStateTitle="Draft Intro Message"
                emptyStateDescription="I'll help you craft a friendly intro asking for a meeting to learn about their business."
                loadingText="Drafting..."
                agentIcon="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                agentName="Intro Drafter"
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
