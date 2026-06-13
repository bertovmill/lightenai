"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const BLOG_ICON = "✍️";

/**
 * Blog writer powered by the "AI Agency Content" managed agent on the Claude
 * platform. Anthropic runs the agent loop + tool container; this page just
 * streams the conversation and mirrors the agent's draft into an editor.
 */
export default function BlogWriterPage() {
  const [draft, setDraft] = useState("");

  // The agent's streamed post body arrives via the document_update SSE event.
  const handleDocumentUpdate = useCallback((content: string) => {
    setDraft(content);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 bg-[#FAFAF8]">
      {/* Chat */}
      <div className="flex w-1/2 min-w-0 flex-col border-r border-[#E8E6E1]">
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

      {/* Draft editor */}
      <div className="flex w-1/2 min-w-0 flex-col">
        <div className="flex items-center justify-between border-b border-[#E8E6E1] px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#888]">
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
