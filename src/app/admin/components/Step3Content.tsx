"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ScheduledPost } from "@/app/components/agents/DocumentEditor";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const DocumentEditor = dynamic(() => import("@/app/components/agents/DocumentEditor"), {
  ssr: false,
});

const CONTENT_ICON = "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10";

const INFO_ICON = "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z";

const PIPELINE_STEPS = [
  { key: "medium", label: "Medium Article", icon: "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z", hint: "Start here — the long-form anchor" },
  { key: "x", label: "X Post", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", hint: "Condensed version of the article" },
  { key: "youtube", label: "YouTube Video", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", hint: "More involved — expand the topic" },
  { key: "tiktok", label: "TikTok", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", hint: "Short-form video clip" },
  { key: "instagram", label: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", hint: "Visual post or reel" },
];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const ABOUT_SECTIONS = [
  {
    title: "What it does",
    content:
      "The Content Creator is an AI-powered writing assistant that helps you draft social media posts for LinkedIn, X, and other platforms. Select an idea, choose a target audience, and the agent drafts ready-to-post content with platform-specific formatting.",
  },
  {
    title: "How a session works",
    items: [
      "Select a content idea from your saved list (or describe a new one).",
      "Optionally pick a target audience to tailor the tone and messaging.",
      "The agent drafts a post formatted for your chosen platform.",
      "Review, edit, and refine the draft through follow-up messages.",
      "When connected, post directly to LinkedIn or X from the chat.",
    ],
  },
  {
    title: "Connected accounts",
    items: [
      "Connect your LinkedIn and X accounts via OAuth for one-click posting.",
      "LinkedIn Company Page posting is supported — add your org ID after connecting.",
      "Expired tokens are flagged so you can reconnect quickly.",
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
        detail: "Conversation history is passed in full with each request. The agent picks up exactly where you left off.",
      },
    ],
  },
  {
    title: "Tools",
    subsections: [
      {
        label: "WebSearch",
        detail: "Searches for trending topics, competitor content, and audience insights to inform drafts.",
      },
      {
        label: "WebFetch",
        detail: "Fetches reference articles and pages to extract key points for content.",
      },
      {
        label: "PostToSocial",
        detail: "Posts directly to connected LinkedIn and X accounts with platform-specific formatting.",
      },
    ],
  },
  {
    title: "Tech stack",
    items: [
      "API route: Next.js App Router (POST /api/agents/content-creator)",
      "LLM: Claude via Anthropic API",
      "Execution: Vercel Sandbox (runAgentInSandbox)",
      "Frontend: React with dynamic import (no SSR)",
      "Chat UI: AgentChat component with SSE streaming",
      "Social: OAuth 2.0 for LinkedIn & X posting",
    ],
  },
];

interface SocialConnection {
  platform: string;
  platformUserId: string;
  profileName: string;
  profileImage: string | null;
  isExpired: boolean;
  orgId: string | null;
  orgName: string | null;
}

const AUDIENCE_PRESETS = [
  "Shopify merchants",
  "Small business owners",
  "E-commerce founders",
];

interface ContentIdea {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

interface Step3ContentProps {
  onComplete: () => void;
  isComplete: boolean;
  externalPrompt?: string;
}

export default function Step3Content({ onComplete, isComplete, externalPrompt }: Step3ContentProps) {
  const [pipelineChecked, setPipelineChecked] = useState<Record<string, boolean>>({});
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showIdeasSidebar, setShowIdeasSidebar] = useState(false);
  const [chatInsertText, setChatInsertText] = useState<string | undefined>();
  const [chatInsertKey, setChatInsertKey] = useState(0);
  const [targetAudience, setTargetAudience] = useState("");
  const [autoSendPrompt, setAutoSendPrompt] = useState<string | undefined>();
  const [documentContent, setDocumentContent] = useState("");
  const [showDocument, setShowDocument] = useState(false);
  const [isAgentWriting, setIsAgentWriting] = useState(false);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentWritingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIdeaId = useRef<string | null>(null);
  const headerPortalRef = useRef<HTMLDivElement | null>(null);

  // Load daily pipeline checklist from localStorage (resets each day)
  useEffect(() => {
    const key = `content-pipeline-${getTodayKey()}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setPipelineChecked(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const togglePipelineStep = (stepKey: string) => {
    setPipelineChecked((prev) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      localStorage.setItem(`content-pipeline-${getTodayKey()}`, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    loadIdeas();
    loadConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIdeas = async () => {
    try {
      const res = await fetch("/api/content-ideas");
      if (res.ok) {
        const { data } = await res.json();
        setIdeas(data || []);
      }
    } catch {
      // Silent fail
    }
    setIsLoadingIdeas(false);
  };

  const loadConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/social/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoadingConnections(false);
    }
  }, []);

  // Check for social_connected query param after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("social_connected") || params.get("social_error")) {
      // Reload connections after OAuth redirect
      loadConnections();
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("social_connected");
      url.searchParams.delete("social_error");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [loadConnections]);

  const addIdea = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() || null }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setIdeas((prev) => [data, ...prev]);
          setNewTitle("");
          setNewDescription("");
          setShowAddForm(false);
        }
      }
    } catch {
      // Silent fail
    }
  };

  const markIdeaUsed = async (id: string) => {
    await fetch("/api/content-ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const deleteIdea = async (id: string) => {
    await fetch(`/api/content-ideas?id=${id}`, { method: "DELETE" });
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSelectIdea = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    if (idea.id !== prevIdeaId.current) {
      prevIdeaId.current = idea.id;
    }
  };

  // Open chat when an external prompt is passed in (e.g. from News step)
  useEffect(() => {
    if (externalPrompt) {
      setAutoSendPrompt(externalPrompt);
      setShowChat(true);
      window.history.pushState(null, "", "#content-creator");
    }
  }, [externalPrompt]);

  // Sync URL hash with chat overlay state
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "content-creator") {
      setShowChat(true);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash !== "content-creator") {
        setShowChat(false);
        setAutoSendPrompt(undefined);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openContentCreator = () => {
    const audience = targetAudience.trim() || undefined;
    if (selectedIdea) {
      let prompt = `Help me create content about: ${selectedIdea.title}.`;
      if (selectedIdea.description) prompt += ` Context: ${selectedIdea.description}.`;
      if (audience) prompt += ` Target audience: ${audience}.`;
      prompt += ` Draft it so I can post to social media (LinkedIn, X, etc).`;
      setAutoSendPrompt(prompt);
    } else {
      setAutoSendPrompt(undefined);
    }
    setShowChat(true);
    window.history.pushState(null, "", "#content-creator");
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setAutoSendPrompt(undefined);
    window.history.pushState(null, "", window.location.pathname);
  };

  const buildStarterPrompts = (): string[] => {
    if (selectedIdea) {
      const audience = targetAudience.trim() || undefined;
      let prompt = `Help me create content about: ${selectedIdea.title}.`;
      if (selectedIdea.description) prompt += ` Context: ${selectedIdea.description}.`;
      if (audience) prompt += ` Target audience: ${audience}.`;
      return [prompt];
    }
    return [
      "Quick Start — interview me to find content ideas",
      "Draft a LinkedIn post about AI agents for small businesses",
      "Help me write a thought leadership post about automation",
    ];
  };

  // Load document when session changes (user scoped server-side)
  const loadDocument = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/agent-documents?session_id=${sessionId}`);
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setDocumentContent(data.content || "");
          if (data.content) setShowDocument(true);
        } else {
          setDocumentContent("");
        }
      } else {
        setDocumentContent("");
      }
    } catch {
      setDocumentContent("");
    }
  }, []);

  // Debounced save (Drizzle upsert, user derived server-side)
  const saveDocument = useCallback(async (sessionId: string, content: string) => {
    try {
      await fetch("/api/agent-documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, agent_id: "content-creator", content }),
      });
    } catch {
      // Silent fail
    }
  }, []);

  const handleSessionChange = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
    if (sessionId) {
      loadDocument(sessionId);
    } else {
      setDocumentContent("");
    }
  }, [loadDocument]);

  // Auto-save document on changes (debounced 1s)
  useEffect(() => {
    if (!currentSessionId || !documentContent) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDocument(currentSessionId, documentContent);
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [documentContent, currentSessionId, saveDocument]);

  const getConnection = (platform: string) =>
    connections.find((c) => c.platform === platform);

  const handleDisconnect = async (platform: string) => {
    try {
      const res = await fetch(`/api/social/connections?platform=${platform}`, { method: "DELETE" });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.platform !== platform));
      }
    } catch {
      // Silent fail
    }
  };

  const handleSaveOrgId = async (orgId: string, orgName: string) => {
    try {
      const res = await fetch("/api/social/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "linkedin", orgId: orgId || null, orgName: orgName || null }),
      });
      if (res.ok) {
        setConnections((prev) =>
          prev.map((c) =>
            c.platform === "linkedin" ? { ...c, orgId: orgId || null, orgName: orgName || null } : c
          )
        );
      }
    } catch {
      // Silent fail
    }
  };

  const linkedInConnection = getConnection("linkedin");
  const linkedInOrgConnection = getConnection("linkedin_org");

  const connectedPlatforms = connections
    .filter((c) => !c.isExpired)
    .map((c) => c.platform);

  const hasLinkedInOrg = !!linkedInOrgConnection;

  const handlePostToSocial = useCallback(async (platform: string, text: string, imageUrl?: string, asOrganization?: boolean, markdownContent?: string) => {
    const res = await fetch("/api/social/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, text, imageUrl, asOrganization, markdownContent }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Post failed");
    }
  }, []);

  // Scheduled posts state & handlers
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const loadScheduledPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/social/schedule");
      if (res.ok) {
        const data = await res.json();
        setScheduledPosts(data.posts || []);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    loadScheduledPosts();
  }, [loadScheduledPosts]);

  const handleSchedulePost = useCallback(async (platform: string, text: string, scheduledAt: string, imageUrl?: string, asOrganization?: boolean, markdownContent?: string) => {
    const res = await fetch("/api/social/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, text, scheduledAt, imageUrl, asOrganization, markdownContent }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Schedule failed");
    }
    await loadScheduledPosts();
  }, [loadScheduledPosts]);

  const handleCancelScheduled = useCallback(async (id: string) => {
    const res = await fetch(`/api/social/schedule?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Cancel failed");
    }
    await loadScheduledPosts();
  }, [loadScheduledPosts]);

  const pipelineDone = PIPELINE_STEPS.filter((s) => pipelineChecked[s.key]).length;

  return (
    <div>
      {/* Daily Content Pipeline */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#5F9468] uppercase tracking-wider">
            Today&apos;s Pipeline
          </h4>
          <span className="text-[11px] text-[#999]">
            {pipelineDone}/{PIPELINE_STEPS.length} done
          </span>
        </div>
        <div className="space-y-1">
          {PIPELINE_STEPS.map((step, i) => {
            const checked = !!pipelineChecked[step.key];
            const prevDone = i === 0 || !!pipelineChecked[PIPELINE_STEPS[i - 1].key];
            return (
              <button
                key={step.key}
                onClick={() => togglePipelineStep(step.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left ${
                  checked
                    ? "bg-[#5F9468]/5 border-[#5F9468]/30"
                    : prevDone
                    ? "bg-white border-[#E8E6E1] hover:border-[#5F9468]/50"
                    : "bg-[#FAFAF8] border-[#E8E6E1]/60 opacity-50"
                }`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "bg-[#5F9468] border-[#5F9468]" : "border-[#ccc]"
                }`}>
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {/* Platform icon */}
                <svg className={`w-4 h-4 shrink-0 ${checked ? "text-[#5F9468]" : "text-[#999]"}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d={step.icon} />
                </svg>
                {/* Label & hint */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${checked ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"}`}>
                    {step.label}
                  </span>
                  <span className="text-[11px] text-[#999] ml-2">{step.hint}</span>
                </div>
                {/* Step number */}
                <span className={`text-[10px] font-semibold shrink-0 ${checked ? "text-[#5F9468]" : "text-[#ccc]"}`}>
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
        {pipelineDone === PIPELINE_STEPS.length && (
          <div className="mt-2 text-center py-2 rounded-lg bg-[#5F9468]/10 border border-[#5F9468]/20">
            <p className="text-sm font-medium text-[#5F9468]">All content done for today!</p>
          </div>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-[#5F9468] uppercase tracking-wider mb-2">
          Connected Accounts
        </h4>
        {isLoadingConnections ? (
          <div className="text-xs text-[#999] py-2">Loading connections...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {/* X connection */}
            {(() => {
              const xConn = getConnection("x");
              return xConn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E6E1]">
                  <svg className="w-4 h-4 text-[#1C1C1C]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-xs text-[#1C1C1C] font-medium">{xConn.profileName}</span>
                  {xConn.isExpired && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Expired</span>
                  )}
                  <button
                    onClick={() => handleDisconnect("x")}
                    className="text-[#999] hover:text-red-500 transition-colors ml-1"
                    title="Disconnect"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/x"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#E8E6E1] text-[#666] hover:border-[#5F9468]/50 hover:text-[#1C1C1C] hover:bg-[#5F9468]/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Connect X
                </a>
              );
            })()}

            {/* LinkedIn Personal connection */}
            {(() => {
              const liConn = getConnection("linkedin");
              return liConn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E6E1]">
                  <svg className="w-4 h-4 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-xs text-[#1C1C1C] font-medium">{liConn.profileName}</span>
                  {liConn.isExpired && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Expired</span>
                  )}
                  <button
                    onClick={() => handleDisconnect("linkedin")}
                    className="text-[#999] hover:text-red-500 transition-colors ml-1"
                    title="Disconnect"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/linkedin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#E8E6E1] text-[#666] hover:border-[#5F9468]/50 hover:text-[#1C1C1C] hover:bg-[#5F9468]/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Connect LinkedIn
                </a>
              );
            })()}

            {/* Instagram connection */}
            {(() => {
              const igConn = getConnection("instagram");
              return igConn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E6E1]">
                  <svg className="w-4 h-4 text-[#E1306C]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <span className="text-xs text-[#1C1C1C] font-medium">{igConn.profileName}</span>
                  {igConn.isExpired && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Expired</span>
                  )}
                  <button
                    onClick={() => handleDisconnect("instagram")}
                    className="text-[#999] hover:text-red-500 transition-colors ml-1"
                    title="Disconnect"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/instagram", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        loadConnections();
                      } else {
                        alert(data.error || "Failed to connect Instagram");
                      }
                    } catch {
                      alert("Failed to connect Instagram");
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#E8E6E1] text-[#666] hover:border-[#E1306C]/50 hover:text-[#1C1C1C] hover:bg-[#E1306C]/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Connect Instagram
                </button>
              );
            })()}

            {/* Medium connection */}
            {(() => {
              const mediumConn = getConnection("medium");
              return mediumConn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E6E1]">
                  <svg className="w-4 h-4 text-[#00AB6C]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                  </svg>
                  <span className="text-xs text-[#1C1C1C] font-medium">{mediumConn.profileName}</span>
                  <button
                    onClick={() => handleDisconnect("medium")}
                    className="text-[#999] hover:text-red-500 transition-colors ml-1"
                    title="Disconnect"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/medium", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        loadConnections();
                      } else {
                        alert(data.error || "Failed to connect Medium");
                      }
                    } catch {
                      alert("Failed to connect Medium");
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#E8E6E1] text-[#666] hover:border-[#00AB6C]/50 hover:text-[#1C1C1C] hover:bg-[#00AB6C]/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                  </svg>
                  Connect Medium
                </button>
              );
            })()}

            {/* Facebook Page connection */}
            {(() => {
              const fbConn = getConnection("facebook");
              return fbConn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E6E1]">
                  <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-xs text-[#1C1C1C] font-medium">{fbConn.profileName}</span>
                  <button
                    onClick={() => handleDisconnect("facebook")}
                    className="text-[#999] hover:text-red-500 transition-colors ml-1"
                    title="Disconnect"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/facebook", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        loadConnections();
                      } else {
                        alert(data.error || "Failed to connect Facebook Page");
                      }
                    } catch {
                      alert("Failed to connect Facebook Page");
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#E8E6E1] text-[#666] hover:border-[#1877F2]/50 hover:text-[#1C1C1C] hover:bg-[#1877F2]/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Connect Facebook Page
                </button>
              );
            })()}

            {/* LinkedIn Company Page connection (separate app with Community Management API) */}
            {(() => {
              const orgConn = getConnection("linkedin_org");
              return orgConn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E6E1]">
                  <svg className="w-4 h-4 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-xs text-[#1C1C1C] font-medium">{orgConn.orgName || "Company Page"}</span>
                  <span className="text-[10px] text-[#0077B5] bg-[#0077B5]/10 px-1.5 py-0.5 rounded">Company</span>
                  {orgConn.isExpired && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Expired</span>
                  )}
                  <button
                    onClick={() => handleDisconnect("linkedin_org")}
                    className="text-[#999] hover:text-red-500 transition-colors ml-1"
                    title="Disconnect"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/linkedin-org"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#E8E6E1] text-[#666] hover:border-[#0077B5]/50 hover:text-[#1C1C1C] hover:bg-[#0077B5]/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Connect Company Page
                </a>
              );
            })()}
          </div>
        )}
      </div>

      {/* Ideas section */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#5F9468] uppercase tracking-wider">
            Your Ideas ({ideas.length})
          </h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-[#5F9468] hover:text-[#4F8357] transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={showAddForm ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
            </svg>
            {showAddForm ? "Cancel" : "Add idea"}
          </button>
        </div>

        {/* Add idea form */}
        {showAddForm && (
          <div className="mb-3 p-3 rounded-lg bg-[#FAFAF8] border border-[#E8E6E1]">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What's the idea?"
              className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-2 text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] mb-2"
              onKeyDown={(e) => { if (e.key === "Enter") addIdea(); }}
            />
            <textarea
              value={newDescription}
              onChange={(e) => {
                setNewDescription(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Any extra context? (optional)"
              rows={2}
              className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-2 text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] resize-none mb-2 overflow-hidden"
            />
            <button
              onClick={addIdea}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#5F9468] text-white text-xs font-medium hover:bg-[#4F8357] transition-colors disabled:opacity-50"
            >
              Save idea
            </button>
          </div>
        )}

        {/* Ideas list */}
        {isLoadingIdeas ? (
          <div className="text-xs text-[#999] py-2">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <p className="text-xs text-[#999] py-1">No ideas saved yet. Add one above or jot them down anytime.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                  selectedIdea?.id === idea.id
                    ? "bg-[#5F9468]/10 border-[#5F9468] text-[#1C1C1C]"
                    : "bg-white border-[#E8E6E1] text-[#555] hover:border-[#5F9468]/50 hover:text-[#1C1C1C]"
                }`}
                onClick={() => handleSelectIdea(idea)}
                title={idea.description || idea.title}
              >
                <svg className="w-3.5 h-3.5 text-[#5F9468] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                <span className="text-xs leading-snug line-clamp-3 max-w-[200px]">{idea.title}</span>

                {/* Actions on hover */}
                <span className="hidden group-hover:flex items-center gap-0.5 ml-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); markIdeaUsed(idea.id); }}
                    className="p-0.5 text-[#5F9468] hover:text-[#4F8357]"
                    title="Mark as used"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id); }}
                    className="p-0.5 text-[#999] hover:text-red-500"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Selected idea detail */}
        {selectedIdea && (
          <div className="mt-2 p-3 rounded-lg bg-[#5F9468]/5 border border-[#5F9468]/20">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2 min-w-0">
                <svg className="w-4 h-4 text-[#5F9468] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1C1C1C]">{selectedIdea.title}</p>
                  {selectedIdea.description && (
                    <p className="text-xs text-[#666] mt-0.5">{selectedIdea.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-[#999] hover:text-[#666] shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Target audience */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-[#5F9468] uppercase tracking-wider mb-1.5">Target audience</p>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {AUDIENCE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTargetAudience(targetAudience === preset ? "" : preset)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      targetAudience === preset
                        ? "bg-[#5F9468] text-white"
                        : "bg-white border border-[#E8E6E1] text-[#555] hover:border-[#5F9468]/50 hover:text-[#1C1C1C]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              {!AUDIENCE_PRESETS.includes(targetAudience) && (
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Or type a custom audience..."
                  className="w-full bg-white border border-[#E8E6E1] rounded-lg px-2.5 py-1.5 text-xs text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468]"
                />
              )}
            </div>

            {/* Open Content Creator */}
            <button
              onClick={openContentCreator}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={CONTENT_ICON} />
              </svg>
              Open Content Creator
            </button>
          </div>
        )}
      </div>

      {/* Open Content Creator button — only when no idea selected */}
      {!selectedIdea && (
        <button
          onClick={openContentCreator}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#5F9468]/30 bg-[#5F9468]/5 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/10 hover:border-[#5F9468]/50 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={CONTENT_ICON} />
          </svg>
          Open Content Creator
        </button>
      )}

      {/* Full-screen agent chat overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col">
          {/* Header bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E6E1] bg-white shrink-0">
            <button
              onClick={handleCloseChat}
              className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#1C1C1C] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#5F9468] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={CONTENT_ICON} />
              </svg>
              <span className="text-sm font-medium text-[#1C1C1C] truncate">
                {selectedIdea ? `Content Creator — ${selectedIdea.title}` : "Content Creator"}
              </span>
            </div>
            {/* Portal target for AgentChat header controls */}
            <div ref={headerPortalRef} className="ml-auto" />
            {/* Ideas toggle */}
            <button
              onClick={() => setShowIdeasSidebar(!showIdeasSidebar)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showIdeasSidebar
                  ? "bg-[#5F9468] text-white"
                  : "bg-[#F5F4F0] text-[#666] hover:bg-[#ECEAE5] hover:text-[#1C1C1C]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Ideas
              {ideas.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  showIdeasSidebar ? "bg-white/20 text-white" : "bg-[#5F9468]/10 text-[#5F9468]"
                }`}>
                  {ideas.length}
                </span>
              )}
            </button>
            {/* Document toggle */}
            <button
              onClick={() => setShowDocument(!showDocument)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showDocument
                  ? "bg-[#5F9468] text-white"
                  : "bg-[#F5F4F0] text-[#666] hover:bg-[#ECEAE5] hover:text-[#1C1C1C]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Document
              {documentContent && (
                <span className={`w-1.5 h-1.5 rounded-full ${isAgentWriting ? "bg-white animate-pulse" : "bg-white/60"}`} />
              )}
            </button>
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

          {/* Main content area — ideas sidebar + chat + optional about shelf */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Ideas sidebar — slides in from left */}
            <div className="relative shrink-0 flex">
              <div
                className={`border-r border-[#E8E6E1] bg-white overflow-y-auto transition-all duration-300 ease-in-out ${
                  showIdeasSidebar ? "w-[300px] opacity-100" : "w-0 opacity-0 border-r-0"
                }`}
              >
                <div className="w-[300px] p-4">
                {/* Sidebar header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-semibold text-[#5F9468] uppercase tracking-[0.15em]">
                    Your Ideas ({ideas.length})
                  </h4>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-xs text-[#5F9468] hover:text-[#4F8357] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={showAddForm ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
                    </svg>
                    {showAddForm ? "Cancel" : "Add"}
                  </button>
                </div>

                {/* Inline add idea form */}
                {showAddForm && (
                  <div className="mb-3 p-3 rounded-lg bg-[#FAFAF8] border border-[#E8E6E1]">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="What's the idea?"
                      className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-2 text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] mb-2"
                      onKeyDown={(e) => { if (e.key === "Enter") addIdea(); }}
                    />
                    <textarea
                      value={newDescription}
                      onChange={(e) => {
                        setNewDescription(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      placeholder="Extra context? (optional)"
                      rows={2}
                      className="w-full bg-white border border-[#E8E6E1] rounded-lg px-3 py-2 text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] resize-none mb-2 overflow-hidden"
                    />
                    <button
                      onClick={addIdea}
                      disabled={!newTitle.trim()}
                      className="px-4 py-1.5 rounded-lg bg-[#5F9468] text-white text-xs font-medium hover:bg-[#4F8357] transition-colors disabled:opacity-50"
                    >
                      Save idea
                    </button>
                  </div>
                )}

                {/* Ideas list */}
                {isLoadingIdeas ? (
                  <div className="text-xs text-[#999] py-2">Loading ideas...</div>
                ) : ideas.length === 0 ? (
                  <p className="text-xs text-[#999] py-1">No ideas yet. Add one above.</p>
                ) : (
                  <div className="space-y-1.5">
                    {ideas.map((idea) => (
                      <button
                        key={idea.id}
                        onClick={() => {
                          const prompt = `Help me create content about: ${idea.title}.${
                            idea.description ? ` Context: ${idea.description}.` : ""
                          } Draft it so I can post to social media.`;
                          setChatInsertText(prompt);
                          setChatInsertKey((k) => k + 1);
                        }}
                        className="group w-full text-left p-2.5 rounded-lg border border-[#E8E6E1] hover:border-[#5F9468]/50 hover:bg-[#5F9468]/5 transition-all"
                        title={idea.description || idea.title}
                      >
                        <div className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-[#5F9468] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#1C1C1C] leading-snug line-clamp-2">{idea.title}</p>
                            {idea.description && (
                              <p className="text-[11px] text-[#888] mt-0.5 line-clamp-2">{idea.description}</p>
                            )}
                          </div>
                          <span className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                            <span
                              onClick={(e) => { e.stopPropagation(); markIdeaUsed(idea.id); }}
                              className="p-0.5 text-[#5F9468] hover:text-[#4F8357] cursor-pointer"
                              title="Mark as used"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span
                              onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id); }}
                              className="p-0.5 text-[#999] hover:text-red-500 cursor-pointer"
                              title="Delete"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
              {/* Edge arrow toggle */}
              <button
                onClick={() => setShowIdeasSidebar(!showIdeasSidebar)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 flex items-center justify-center bg-white border border-[#E8E6E1] rounded-r-lg shadow-sm hover:bg-[#F5F4F0] transition-colors"
                title={showIdeasSidebar ? "Collapse ideas" : "Expand ideas"}
              >
                <svg className={`w-3.5 h-3.5 text-[#666] transition-transform duration-300 ${showIdeasSidebar ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Chat area */}
            <div className={`flex flex-col min-h-0 min-w-0 overflow-hidden px-4 ${showDocument ? "w-1/2" : "flex-1"}`}>
              <AgentChat
                agentId="content-creator"
                apiEndpoint="/api/agents/content-creator"
                storageKey="morning-content-sessions"
                placeholder="Describe your content idea..."
                emptyStateTitle={selectedIdea ? `Draft: ${selectedIdea.title}` : "Create content"}
                emptyStateDescription={
                  selectedIdea
                    ? (selectedIdea.description || "Click the prompt below to start drafting.")
                    : "Pick an idea above or describe a new one. I'll help with writing and formatting."
                }
                loadingText="Drafting..."
                agentIcon={CONTENT_ICON}
                agentName="Content Creator"
                variant="full"
                headerPortalRef={headerPortalRef}
                initialPrompt={autoSendPrompt}
                starterPrompts={buildStarterPrompts()}
                connectedPlatforms={connectedPlatforms}
                linkedInOrgId={linkedInOrgConnection?.orgId}
                linkedInOrgName={linkedInOrgConnection?.orgName}
                insertText={chatInsertText}
                insertTextKey={chatInsertKey}
                fileUpload={{
                  accept: "audio/*,video/*,image/*",
                  maxSizeMB: 100,
                  endpoint: "/api/upload",
                }}
                documentContent={documentContent}
                onDocumentUpdate={(content) => {
                  setDocumentContent(content);
                  setIsAgentWriting(true);
                  if (!showDocument) setShowDocument(true);
                  // Reset the writing indicator after updates stop flowing (2s debounce)
                  if (agentWritingTimerRef.current) clearTimeout(agentWritingTimerRef.current);
                  agentWritingTimerRef.current = setTimeout(() => setIsAgentWriting(false), 2000);
                }}
                onSessionChange={handleSessionChange}
              />
            </div>

            {/* Document editor panel */}
            <div className={`relative flex transition-all duration-300 ease-in-out ${showDocument ? "w-1/2" : "w-0"}`}>
              {/* Edge arrow toggle */}
              <button
                onClick={() => setShowDocument(!showDocument)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 flex items-center justify-center bg-white border border-[#E8E6E1] rounded-l-lg shadow-sm hover:bg-[#F5F4F0] transition-colors"
                title={showDocument ? "Collapse document" : "Expand document"}
              >
                <svg className={`w-3.5 h-3.5 text-[#666] transition-transform duration-300 ${showDocument ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div
                className={`flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden border-l border-[#E8E6E1] bg-white ${
                  showDocument ? "opacity-100" : "opacity-0 border-l-0"
                }`}
              >
                {showDocument && (
                  <DocumentEditor
                    content={documentContent}
                    onChange={setDocumentContent}
                    isAgentWriting={isAgentWriting}
                    connectedPlatforms={connectedPlatforms}
                    onPostToSocial={handlePostToSocial}
                    linkedInOrgName={linkedInOrgConnection?.orgName}
                    onSchedulePost={handleSchedulePost}
                    scheduledPosts={scheduledPosts}
                    onCancelScheduled={handleCancelScheduled}
                    onRefreshScheduled={loadScheduledPosts}
                  />
                )}
              </div>
            </div>

            {/* About shelf — slides in from right */}
            <div
              className={`shrink-0 border-l border-[#E8E6E1] bg-white overflow-y-auto transition-all duration-300 ease-in-out ${
                showAbout ? "w-[380px] opacity-100" : "w-0 opacity-0 border-l-0"
              }`}
            >
              <div className="w-[380px] p-5">
                {/* Shelf header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E8E6E1]">
                  <div className="w-10 h-10 rounded-xl bg-[#5F9468]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={CONTENT_ICON} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1C1C1C]">Content Creator</h3>
                    <p className="text-[11px] text-[#999]">AI writing assistant</p>
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
      )}

      {!isComplete && (
        <button
          onClick={() => {
            if (selectedIdea) markIdeaUsed(selectedIdea.id);
            onComplete();
          }}
          className="mt-3 w-full px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
        >
          Mark Content as Done
        </button>
      )}

      {isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full py-2.5 text-center rounded-lg bg-[#5F9468]/5 hover:bg-[#5F9468]/10 transition-colors"
        >
          <p className="text-sm text-[#5F9468] font-medium">Content created! (click to undo)</p>
        </button>
      )}
    </div>
  );
}
