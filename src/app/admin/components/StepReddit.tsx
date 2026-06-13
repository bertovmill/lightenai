"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const REDDIT_ICON = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-1.5-5.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Zm3 0a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Zm-4.94 1.69a.75.75 0 0 1 1.06-.06c.853.74 1.93 1.12 3.38 1.12s2.527-.38 3.38-1.12a.75.75 0 0 1 .998 1.12c-1.148.996-2.598 1.5-4.378 1.5s-3.23-.504-4.378-1.5a.75.75 0 0 1-.06-1.06Z";

const INFO_ICON = "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z";

const ABOUT_SECTIONS = [
  {
    title: "What it does",
    content:
      "The Reddit Agent searches Reddit for recent questions about the Claude Agents SDK, Anthropic API, and AI agent development. It finds unanswered or under-answered posts and drafts helpful, technically accurate replies you can post.",
  },
  {
    title: "How a session works",
    items: [
      "You click \"Find Questions\" and the agent searches Reddit for recent SDK-related questions.",
      "It reads the top threads to understand what people are asking.",
      "It picks the 3-5 best opportunities (unanswered, recent, high-value).",
      "For each, it drafts a genuinely helpful answer with code examples where relevant.",
      "You review, edit, and post the answers yourself.",
    ],
  },
  {
    title: "Subreddits covered",
    items: [
      "r/ClaudeAI — Primary Claude community",
      "r/artificial — Broader AI discussion",
      "r/MachineLearning — Technical ML community",
      "r/LangChain — Agent framework discussion",
      "r/LocalLLaMA — LLM development community",
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
        detail: "Searches Reddit with site-specific queries for Claude SDK, Anthropic API, and agent development questions.",
      },
      {
        label: "WebFetch",
        detail: "Reads full Reddit threads to understand the question, existing answers, and context.",
      },
    ],
  },
];

interface StepRedditProps {
  onComplete: () => void;
  isComplete: boolean;
}

const MIN_SHELF_WIDTH = 240;
const MAX_SHELF_WIDTH = 600;
const DEFAULT_SHELF_WIDTH = 380;

export default function StepReddit({ onComplete, isComplete }: StepRedditProps) {
  const [showChat, setShowChat] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [shelfWidth, setShelfWidth] = useState(DEFAULT_SHELF_WIDTH);
  const isDragging = useRef(false);
  const headerPortalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "reddit-sdk") {
      setShowChat(true);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash !== "reddit-sdk") {
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
      <p className="text-sm text-[#666] mb-4 leading-relaxed">
        Search Reddit for questions about Claude Agents SDK, Anthropic API, and
        AI agent development. Find unanswered posts and draft helpful replies to
        build community presence.
      </p>

      <button
        onClick={() => {
          setShowChat(true);
          window.history.pushState(null, "", "#reddit-sdk");
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        Find Questions
      </button>

      {showChat && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col">
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
                <path strokeLinecap="round" strokeLinejoin="round" d={REDDIT_ICON} />
              </svg>
              <span className="text-sm font-medium text-[#1C1C1C] truncate">
                Reddit SDK Q&A
              </span>
            </div>
            <div ref={headerPortalRef} className="ml-auto" />
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

          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden px-4">
              <AgentChat
                agentId="reddit-sdk"
                apiEndpoint="/api/agents/reddit-sdk"
                storageKey="reddit-sdk-sessions"
                placeholder="Ask about Reddit questions on Claude SDK..."
                emptyStateTitle="Reddit SDK Q&A"
                emptyStateDescription="I'll search Reddit for recent questions about Claude Agents SDK and AI agent development, then draft helpful answers you can post."
                loadingText="Searching Reddit..."
                agentIcon={REDDIT_ICON}
                agentName="Reddit SDK"
                variant="full"
                headerPortalRef={headerPortalRef}
                fileUpload={{
                  accept: "image/*",
                  maxSizeMB: 10,
                  endpoint: "/api/upload",
                }}
                starterPrompts={[
                  "Find unanswered questions",
                  "Search r/ClaudeAI",
                  "SDK help opportunities",
                ]}
              />
            </div>

            <div
              className={`shrink-0 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
                showAbout ? "opacity-100" : "opacity-0 border-l-0"
              }`}
              style={{ width: showAbout ? shelfWidth : 0 }}
            >
              <div className="relative h-full flex">
                <div
                  onMouseDown={handleMouseDown}
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group"
                >
                  <div className="absolute inset-y-0 -left-1 w-3" />
                  <div className="h-full w-px bg-[#E8E6E1] group-hover:bg-[#5F9468] group-active:bg-[#5F9468] transition-colors" />
                </div>
              <div className="flex-1 overflow-y-auto p-5 pl-3">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E8E6E1]">
                  <div className="w-10 h-10 rounded-xl bg-[#5F9468]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={REDDIT_ICON} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1C1C1C]">Reddit SDK Q&A</h3>
                    <p className="text-[11px] text-[#999]">Community engagement agent</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {ABOUT_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-[10px] font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-2">
                        {section.title}
                      </h4>

                      {section.content && (
                        <p className="text-[13px] text-[#555] leading-relaxed">
                          {section.content}
                        </p>
                      )}

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

      {!isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
        >
          Mark Reddit Complete
        </button>
      )}

      {isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full py-2.5 text-center rounded-lg bg-[#5F9468]/5 hover:bg-[#5F9468]/10 transition-colors"
        >
          <p className="text-sm text-[#5F9468] font-medium">Reddit complete! (click to undo)</p>
        </button>
      )}
    </div>
  );
}
