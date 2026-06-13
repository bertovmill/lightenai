"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const BLOG_ICON = "✍️";

/* Pull the article title from the first markdown H1, falling back to the
 * first non-empty line. Keeps the publish title in sync with what the agent writes. */
function deriveTitle(draft: string): string {
  const h1 = draft.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const firstLine = draft.split("\n").find((l) => l.trim().length > 0);
  return (firstLine ?? "").replace(/^#+\s*/, "").trim().slice(0, 120);
}

/* First real paragraph, stripped of markdown, for the post excerpt. */
function deriveExcerpt(draft: string): string {
  const para = draft
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith("!["));
  if (!para) return "";
  return para
    .replace(/[#*`_>]/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

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

  // Publish state
  const [title, setTitle] = useState("");
  const titleEdited = useRef(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [status, setStatus] = useState<{ msg: string; tone: "info" | "error" } | null>(null);
  // Identity of the saved post so re-saves update instead of duplicating.
  const [postId, setPostId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  const handleDocumentUpdate = useCallback((content: string) => {
    setDraft(content);
  }, []);

  // Keep the title synced to the draft's H1 until the user types their own.
  useEffect(() => {
    if (!titleEdited.current) {
      const derived = deriveTitle(draft);
      if (derived) setTitle(derived);
    }
  }, [draft]);

  async function handleGenerateCover() {
    if (!title.trim() || generating) return;
    setGenerating(true);
    setStatus({ msg: "Generating cover image…", tone: "info" });
    try {
      const res = await fetch("/api/blog/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCoverUrl(data.url);
      setStatus({ msg: "Cover ready.", tone: "info" });
    } catch (err) {
      setStatus({ msg: err instanceof Error ? err.message : "Cover generation failed", tone: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(nextStatus: "draft" | "published") {
    if (!title.trim() || !draft.trim() || saving) return;
    setSaving(nextStatus);
    setStatus({ msg: nextStatus === "published" ? "Publishing…" : "Saving draft…", tone: "info" });
    try {
      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          topicId,
          title: title.trim(),
          body: draft,
          excerpt: deriveExcerpt(draft),
          imageUrl: coverUrl,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setPostId(data.postId);
      setTopicId(data.topicId);
      setLiveUrl(data.url);
      setStatus({
        msg: nextStatus === "published" ? "Published live 🎉" : "Draft saved.",
        tone: "info",
      });
    } catch (err) {
      setStatus({ msg: err instanceof Error ? err.message : "Save failed", tone: "error" });
    } finally {
      setSaving(null);
    }
  }

  const busy = generating || saving !== null;

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

        {/* Cover preview */}
        {coverUrl && (
          <div className="border-b border-[#E8E6E1] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt="Article cover"
              className="aspect-video w-full rounded-xl border border-[#E8E6E1] object-cover"
            />
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Your draft will appear here as the agent writes. You can edit it directly — your changes are sent back on the next message."
          className="flex-1 resize-none bg-transparent px-6 py-5 font-sans text-[15px] leading-relaxed text-[#1C1C1C] outline-none placeholder:text-[#bbb]"
        />

        {/* Publish toolbar */}
        <div className="border-t border-[#E8E6E1] bg-[#FAFAF8] px-3 py-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              titleEdited.current = true;
              setTitle(e.target.value);
            }}
            placeholder="Post title"
            className="mb-2.5 w-full rounded-lg border border-[#E8E6E1] bg-white px-3 py-2 text-sm text-[#1C1C1C] outline-none focus:border-[#6B8F71]"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateCover}
              disabled={!title.trim() || busy}
              className="rounded-full border border-[#1C1C1C] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#1C1C1C] transition-opacity disabled:opacity-30"
            >
              {generating ? "Generating…" : coverUrl ? "Regenerate cover" : "Generate cover"}
            </button>

            <div className="flex-1" />

            <button
              onClick={() => handleSave("draft")}
              disabled={!title.trim() || !draft.trim() || busy}
              className="rounded-full border border-[#1C1C1C] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#1C1C1C] transition-opacity disabled:opacity-30"
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>

            <button
              onClick={() => handleSave("published")}
              disabled={!title.trim() || !draft.trim() || busy}
              className="rounded-full bg-[#6B8F71] px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#5A7D60] disabled:opacity-30"
            >
              {saving === "published" ? "Publishing…" : postId ? "Update & publish" : "Publish"}
            </button>
          </div>

          {status && (
            <p
              className={[
                "mt-2.5 text-xs",
                status.tone === "error" ? "text-red-600" : "text-[#666]",
              ].join(" ")}
            >
              {status.msg}
              {liveUrl && status.tone !== "error" && (
                <>
                  {" "}
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#6B8F71] underline"
                  >
                    View post →
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
