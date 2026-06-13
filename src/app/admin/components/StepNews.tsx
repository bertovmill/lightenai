"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const NEWS_ICON = "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5";

const INFO_ICON = "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z";

const ABOUT_SECTIONS = [
  {
    title: "What it does",
    content:
      "The News Agent is a daily briefing assistant that searches for the latest Claude Agents SDK updates, Anthropic announcements, and AI agent ecosystem news. It finds 2-3 high-quality articles and summarizes them with key takeaways and relevance to your work.",
  },
  {
    title: "How a session works",
    items: [
      "You click \"Get today's briefing\" and the agent searches the web for recent news.",
      "It reads the top 2-3 most relevant articles in full.",
      "Each article is summarized with key takeaways and why it matters for building agents.",
      "A bottom-line summary ties the day's news together.",
      "You can ask follow-up questions about any article or topic.",
    ],
  },
  {
    title: "What it covers",
    items: [
      "Claude Agents SDK updates and new features",
      "Anthropic blog posts and announcements",
      "AI agent development ecosystem news",
      "Relevant engineering blog posts and tutorials",
    ],
  },
  {
    title: "Agent architecture",
    subsections: [
      {
        label: "Runtime",
        detail: "Runs in a Vercel ephemeral sandbox — each request is isolated with no persistent server state.",
      },
      {
        label: "Streaming",
        detail: "Responses are delivered via Server-Sent Events (SSE) so you see output in real time.",
      },
      {
        label: "Memory",
        detail: "Conversation history is passed in full with each request. Ask follow-ups without losing context.",
      },
    ],
  },
  {
    title: "Tools",
    subsections: [
      {
        label: "WebSearch",
        detail: "Searches the web for the latest Claude SDK, Anthropic, and AI agent news from the past 24-72 hours.",
      },
      {
        label: "WebFetch",
        detail: "Fetches and reads full articles to extract accurate summaries and key takeaways.",
      },
    ],
  },
  {
    title: "Tech stack",
    items: [
      "API route: Next.js App Router (POST /api/agents/sdk-news)",
      "LLM: Claude via Anthropic API",
      "Execution: Vercel Sandbox (runAgentInSandbox)",
      "Frontend: React with dynamic import (no SSR)",
      "Chat UI: AgentChat component with SSE streaming",
    ],
  },
];

interface StepNewsProps {
  onComplete: () => void;
  isComplete: boolean;
  onCreateContent?: (newsText: string) => void;
}

const MIN_SHELF_WIDTH = 240;
const MAX_SHELF_WIDTH = 600;
const DEFAULT_SHELF_WIDTH = 380;

export default function StepNews({ onComplete, isComplete, onCreateContent }: StepNewsProps) {
  const [showChat, setShowChat] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [shelfWidth, setShelfWidth] = useState(DEFAULT_SHELF_WIDTH);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const isDragging = useRef(false);
  const headerPortalRef = useRef<HTMLDivElement | null>(null);

  // Sync URL hash with chat overlay state
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "sdk-news") {
      setShowChat(true);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash !== "sdk-news") {
        setShowChat(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = shelfWidth;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX - e.clientX;
      const newWidth = Math.min(MAX_SHELF_WIDTH, Math.max(MIN_SHELF_WIDTH, startWidth + delta));
      setShelfWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [shelfWidth]);

  return (
    <div>
      {/* Description */}
      <p className="text-sm text-[#666] mb-4 leading-relaxed">
        Stay current on Claude Agents SDK updates, Anthropic announcements, and
        AI agent ecosystem news. Get a daily briefing with 2-3 curated articles,
        key takeaways, and why they matter for your work.
      </p>

      {/* Open Briefing button */}
      <button
        onClick={() => {
          setShowChat(true);
          window.history.pushState(null, "", "#sdk-news");
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={NEWS_ICON} />
        </svg>
        Get Today&apos;s Briefing
      </button>

      {/* Full-screen agent chat overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col">
          {/* Header bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E6E1] bg-white shrink-0">
            <button
              onClick={() => {
                setShowChat(false);
                window.history.pushState(null, "", window.location.pathname);
              }}
              className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#1C1C1C] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#5F9468] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={NEWS_ICON} />
              </svg>
              <span className="text-sm font-medium text-[#1C1C1C] truncate">
                SDK News
              </span>
            </div>
            {/* Portal target for AgentChat header controls */}
            <div ref={headerPortalRef} className="ml-auto" />
            {/* Create content from news */}
            {onCreateContent && chatMessages.some(m => m.role === "assistant" && m.content.length > 50) && (
              <button
                onClick={() => {
                  const newsText = chatMessages
                    .filter(m => m.role === "assistant")
                    .map(m => m.content)
                    .join("\n\n");
                  onCreateContent(newsText);
                  setShowChat(false);
                  window.history.pushState(null, "", window.location.pathname);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#5F9468] text-white hover:bg-[#4F8357] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Create content from this news
              </button>
            )}
            {/* About toggle */}
            <button
              onClick={() => setShowAbout(!showAbout)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showAbout
                  ? "bg-[#5F9468] text-white"
                  : "bg-[#F5F4F0] text-[#666] hover:bg-[#ECEAE5] hover:text-[#1C1C1C]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={INFO_ICON} />
              </svg>
              About
            </button>
          </div>

          {/* Main content area — chat + optional shelf */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Chat area */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden px-4">
              <AgentChat
                agentId="sdk-news"
                apiEndpoint="/api/agents/sdk-news"
                storageKey="sdk-news-sessions"
                placeholder="Ask about Claude SDK or AI agent news..."
                emptyStateTitle="Daily SDK & AI News"
                emptyStateDescription="I'll search for the latest Claude Agents SDK updates, Anthropic announcements, and AI agent news. Ready for today's briefing?"
                loadingText="Searching for news..."
                agentIcon={NEWS_ICON}
                agentName="SDK News"
                variant="full"
                headerPortalRef={headerPortalRef}
                fileUpload={{
                  accept: "image/*",
                  maxSizeMB: 10,
                  endpoint: "/api/upload",
                }}
                starterPrompts={[
                  "What's new today?",
                  "Latest SDK changes",
                  "Anthropic engineering updates",
                ]}
                onMessagesChange={(msgs) => setChatMessages(msgs.map(m => ({ role: m.role, content: m.content })))}
              />
            </div>

            {/* About shelf — slides in from right, draggable */}
            <div
              className={`shrink-0 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
                showAbout ? "opacity-100" : "opacity-0 border-l-0"
              }`}
              style={{ width: showAbout ? shelfWidth : 0 }}
            >
              <div className="relative h-full flex">
                {/* Drag handle */}
                <div
                  onMouseDown={handleMouseDown}
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group"
                >
                  <div className="absolute inset-y-0 -left-1 w-3" />
                  <div className="h-full w-px bg-[#E8E6E1] group-hover:bg-[#5F9468] group-active:bg-[#5F9468] transition-colors" />
                </div>
              <div className="flex-1 overflow-y-auto p-5 pl-3">
                {/* Shelf header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E8E6E1]">
                  <div className="w-10 h-10 rounded-xl bg-[#5F9468]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={NEWS_ICON} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1C1C1C]">SDK News</h3>
                    <p className="text-[11px] text-[#999]">Daily briefing agent</p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-5">
                  {ABOUT_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-[10px] font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-2">
                        {section.title}
                      </h4>

                      {/* Plain text content */}
                      {section.content && (
                        <p className="text-[13px] text-[#555] leading-relaxed">
                          {section.content}
                        </p>
                      )}

                      {/* Bulleted items */}
                      {section.items && (
                        <ul className="space-y-1.5">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex gap-2 text-[13px] text-[#555] leading-relaxed">
                              <span className="text-[#5F9468] shrink-0 mt-1.5">
                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Labeled subsections (tools, architecture) */}
                      {section.subsections && (
                        <div className="space-y-2.5">
                          {section.subsections.map((sub) => (
                            <div key={sub.label} className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E8E6E1]">
                              <span className="text-xs font-semibold text-[#1C1C1C]">{sub.label}</span>
                              <p className="text-[12px] text-[#666] leading-relaxed mt-0.5">{sub.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              </div>
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
          Mark News Complete
        </button>
      )}

      {isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full py-2.5 text-center rounded-lg bg-[#5F9468]/5 hover:bg-[#5F9468]/10 transition-colors"
        >
          <p className="text-sm text-[#5F9468] font-medium">News complete! (click to undo)</p>
        </button>
      )}
    </div>
  );
}
