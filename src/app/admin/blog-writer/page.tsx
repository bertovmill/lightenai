"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const BLOG_ICON = "✍️";

/* Two-column panel icon — left or right side filled to show which panel is active */
function PanelIcon({ side, active }: { side: "left" | "right"; active: boolean }) {
  const dividerX = side === "left" ? 7 : 9;
  const filledRect =
    side === "left"
      ? { x: 1.5, width: dividerX - 2 }
      : { x: dividerX + 0.5, width: 14 - dividerX };

  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <line x1={dividerX} y1="2" x2={dividerX} y2="14" stroke="currentColor" strokeWidth="1.3" />
      {active && (
        <rect
          x={filledRect.x}
          y="2.5"
          width={filledRect.width}
          height="11"
          fill="currentColor"
          opacity="0.2"
        />
      )}
    </svg>
  );
}

export default function BlogWriterPage() {
  const [draft, setDraft] = useState("");
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [draftCollapsed, setDraftCollapsed] = useState(false);

  const handleDocumentUpdate = useCallback((content: string) => {
    setDraft(content);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 bg-[#FAFAF8]">
      {/* Chat panel */}
      <div
        className={[
          "flex min-w-0 flex-col border-r border-[#E8E6E1] transition-[width] duration-200 ease-in-out",
          chatCollapsed ? "w-0 overflow-hidden" : draftCollapsed ? "flex-1" : "w-1/2",
        ].join(" ")}
      >
        <AgentChat
          agentId="managed-blog"
          apiEndpoint="/api/agents/managed-blog"
          storageKey="managed-blog-sessions"
          placeholder="What should we write about today?"
          emptyStateTitle="Blog Writer"
          emptyStateDescription="Tell me the topic, angle, and audience and I'll draft the post. I keep working in the same session, so you can ask for revisions."
          loadingText="Writing..."
          agentIcon={BLOG_ICON}
          agentName="AI Agency Content"
          variant="full"
          starterPrompts={[
            "Draft a blog post about how small businesses can start with AI automation",
            "Write a post on what we learned shipping our first AI agent",
            "Draft a post explaining MCP to non-technical founders",
          ]}
          documentContent={draft}
          onDocumentUpdate={handleDocumentUpdate}
        />
      </div>

      {/* Draft panel */}
      <div
        className={[
          "flex min-w-0 flex-col transition-[width] duration-200 ease-in-out",
          draftCollapsed ? "w-0 overflow-hidden" : chatCollapsed ? "flex-1" : "w-1/2",
        ].join(" ")}
      >
        {/* Header — panel toggles live here, both clearly visible */}
        <div className="flex items-center gap-2 border-b border-[#E8E6E1] px-3 py-2.5">
          {/* Toggle chat panel */}
          <button
            onClick={() => setChatCollapsed((v) => !v)}
            title={chatCollapsed ? "Show chat" : "Hide chat"}
            className={[
              "rounded-md p-1.5 transition-colors",
              chatCollapsed
                ? "bg-[#E8E6E1] text-[#1C1C1C]"
                : "text-[#666] hover:bg-[#EEEDE8] hover:text-[#1C1C1C]",
            ].join(" ")}
          >
            <PanelIcon side="left" active={!chatCollapsed} />
          </button>

          {/* Toggle draft panel */}
          <button
            onClick={() => setDraftCollapsed((v) => !v)}
            title={draftCollapsed ? "Show draft" : "Hide draft"}
            className={[
              "rounded-md p-1.5 transition-colors",
              draftCollapsed
                ? "bg-[#E8E6E1] text-[#1C1C1C]"
                : "text-[#666] hover:bg-[#EEEDE8] hover:text-[#1C1C1C]",
            ].join(" ")}
          >
            <PanelIcon side="right" active={!draftCollapsed} />
          </button>

          <span className="flex-1 text-center text-xs font-semibold uppercase tracking-[0.15em] text-[#888]">
            Draft
          </span>

          <button
            onClick={() => navigator.clipboard.writeText(draft)}
            disabled={!draft}
            className="rounded-full border border-[#1C1C1C] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#1C1C1C] disabled:opacity-30"
          >
            Copy
          </button>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Your draft will appear here as the agent writes. You can edit it directly — your changes are sent back on the next message."
          className="flex-1 resize-none bg-transparent px-6 py-5 font-sans text-[15px] leading-relaxed text-[#1C1C1C] outline-none placeholder:text-[#bbb]"
        />
      </div>
    </div>
  );
}
