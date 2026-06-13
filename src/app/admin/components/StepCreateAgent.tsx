"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

// People/outreach icon
const OUTREACH_ICON = "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z";

// Magnifying glass + person icon for lead scout
const SCOUT_ICON = "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z";

type Tab = "find" | "draft";

interface StepLeadOutreachProps {
  onComplete: () => void;
  isComplete: boolean;
}

export default function StepLeadOutreach({ onComplete, isComplete }: StepLeadOutreachProps) {
  const [activeTab, setActiveTab] = useState<Tab>("find");
  const [showChat, setShowChat] = useState(false);
  const [chatAgent, setChatAgent] = useState<Tab>("find");
  const [autoStartPrompt, setAutoStartPrompt] = useState<string | undefined>(undefined);
  const headerPortalRef = useRef<HTMLDivElement | null>(null);

  // Sync URL hash with chat overlay state
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "lead-scout") {
      setChatAgent("find");
      setShowChat(true);
    } else if (hash === "lead-outreach") {
      setChatAgent("draft");
      setShowChat(true);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash !== "lead-scout" && hash !== "lead-outreach") {
        setShowChat(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openChat = (agent: Tab) => {
    setAutoStartPrompt(undefined);
    setChatAgent(agent);
    setShowChat(true);
    const hash = agent === "find" ? "lead-scout" : "lead-outreach";
    window.history.pushState(null, "", `#${hash}`);
  };

  const closeChat = () => {
    setShowChat(false);
    setAutoStartPrompt(undefined);
    window.history.pushState(null, "", window.location.pathname);
  };

  const agentConfig = chatAgent === "find"
    ? {
        apiEndpoint: "/api/agents/lead-scout",
        storageKey: "lead-scout-sessions",
        placeholder: "Describe the kind of prospects you're looking for...",
        emptyStateTitle: "Lead Scout",
        emptyStateDescription: "I'll search LinkedIn, Reddit, and X to find prospects who need AI automation. Tell me what kind of client you're looking for.",
        agentIcon: SCOUT_ICON,
        agentName: "Lead Scout",
        headerLabel: "Lead Scout",
        starterPrompts: [
          "Find founders struggling with content creation who might need AI automation",
          "Search Reddit for small business owners asking about AI tools",
          "Look for LinkedIn posts from agency owners discussing scaling challenges",
        ],
      }
    : {
        apiEndpoint: "/api/agents/outreach",
        storageKey: "lead-outreach-sessions",
        placeholder: "Describe the lead you want to reach out to...",
        emptyStateTitle: "Lead Outreach",
        emptyStateDescription: "I'll research prospects and draft LinkedIn messages — connection requests, first DMs, and follow-ups. Share a name, LinkedIn URL, or company to get started.",
        agentIcon: OUTREACH_ICON,
        agentName: "Outreach",
        headerLabel: "Lead Outreach",
        starterPrompts: [
          "Draft a LinkedIn connection request for a prospect I found",
          "Research [name/company] and write a personalized first DM",
          "Write a follow-up for someone who accepted my connection request",
        ],
      };

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-[#F0EFEC] rounded-lg mb-4">
        <button
          onClick={() => setActiveTab("find")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "find"
              ? "bg-white text-[#1C1C1C] shadow-sm"
              : "text-[#888] hover:text-[#666]"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={SCOUT_ICON} />
          </svg>
          Find Leads
        </button>
        <button
          onClick={() => setActiveTab("draft")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "draft"
              ? "bg-white text-[#1C1C1C] shadow-sm"
              : "text-[#888] hover:text-[#666]"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={OUTREACH_ICON} />
          </svg>
          Draft Messages
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "find" ? (
        <div>
          <p className="text-sm text-[#666] mb-4 leading-relaxed">
            Scout the web for potential prospects — LinkedIn, Reddit, and X. The agent researches and ranks leads by fit.
          </p>
          <button
            onClick={() => openChat("find")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={SCOUT_ICON} />
            </svg>
            Open Lead Scout
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[#666] mb-4 leading-relaxed">
            Draft personalized LinkedIn messages for prospects you&apos;ve identified.
          </p>
          <button
            onClick={() => openChat("draft")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={OUTREACH_ICON} />
            </svg>
            Open Outreach Chat
          </button>
        </div>
      )}

      {/* Full-screen agent chat overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col">
          {/* Header bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E6E1] bg-white shrink-0">
            <button
              onClick={closeChat}
              className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#1C1C1C] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#5F9468] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={agentConfig.agentIcon} />
              </svg>
              <span className="text-sm font-medium text-[#1C1C1C] truncate">
                {agentConfig.headerLabel}
              </span>
            </div>
            {/* Portal target for AgentChat header controls */}
            <div ref={headerPortalRef} className="ml-auto" />
          </div>

          {/* Main content area — chat */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex flex-col min-h-0 min-w-0 overflow-hidden px-4 flex-1">
              <AgentChat
                agentId={chatAgent === "find" ? "lead-scout" : "outreach"}
                apiEndpoint={agentConfig.apiEndpoint}
                storageKey={agentConfig.storageKey}
                placeholder={agentConfig.placeholder}
                emptyStateTitle={agentConfig.emptyStateTitle}
                emptyStateDescription={agentConfig.emptyStateDescription}
                loadingText="Thinking..."
                agentIcon={agentConfig.agentIcon}
                agentName={agentConfig.agentName}
                variant="full"
                headerPortalRef={headerPortalRef}
                initialPrompt={autoStartPrompt}
                starterPrompts={agentConfig.starterPrompts}
                fileUpload={{
                  accept: "image/*",
                  maxSizeMB: 20,
                  endpoint: "/api/upload",
                  imageEndpoint: "/api/fal/upload",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mark complete / undo */}
      {!isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
        >
          Mark Outreach Complete
        </button>
      )}

      {isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full py-2.5 text-center rounded-lg bg-[#5F9468]/5 hover:bg-[#5F9468]/10 transition-colors"
        >
          <p className="text-sm text-[#5F9468] font-medium">Outreach complete! (click to undo)</p>
        </button>
      )}
    </div>
  );
}
