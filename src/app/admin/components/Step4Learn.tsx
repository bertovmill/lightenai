"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

const LEARN_ICON = "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5";

const CONFIG_ICON = "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z";
const CONFIG_ICON_INNER = "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z";

const ALL_TOOLS = [
  { name: "WebSearch", description: "Search the web for current information" },
  { name: "WebFetch", description: "Fetch and read web page content" },
  { name: "AskUserQuestion", description: "Ask interactive multiple-choice questions" },
  { name: "Read", description: "Read files from the filesystem" },
  { name: "Glob", description: "Find files by pattern matching" },
  { name: "Grep", description: "Search file contents with regex" },
  { name: "Bash", description: "Execute shell commands" },
  { name: "Write", description: "Write files to the filesystem" },
  { name: "Edit", description: "Edit existing files with replacements" },
];

const INFO_SECTIONS = [
  {
    title: "Architecture",
    items: [
      "Runtime: E2B ephemeral sandbox — each request is isolated",
      "Streaming: Server-Sent Events (SSE) for real-time output",
      "Memory: Full conversation history passed with each request",
    ],
  },
  {
    title: "Tech stack",
    items: [
      "API route: Next.js App Router (POST /api/agents/sdk-tutor)",
      "LLM: Claude via Anthropic API",
      "Execution: E2B Sandbox (runAgentInSandbox)",
      "Frontend: React with dynamic import (no SSR)",
      "Chat UI: AgentChat component with SSE streaming",
    ],
  },
];

type ShelfTab = "prompt" | "tools" | "history" | "info";

interface AgentConfig {
  systemPrompt: string;
  allowedTools: string[];
  isOverride: boolean;
  updatedAt?: string;
}

interface ConfigVersion {
  id: string;
  agent_id: string;
  source: string;
  note: string | null;
  allowed_tools: string[];
  created_at: string;
  system_prompt?: string;
}

interface QuizScore {
  id: string;
  score: number;
  total: number;
  date: string;
  created_at: string;
  session_id?: string;
}

interface Step4LearnProps {
  onComplete: () => void;
  isComplete: boolean;
}

const MIN_SHELF_WIDTH = 240;
const MAX_SHELF_WIDTH = 600;
const DEFAULT_SHELF_WIDTH = 380;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Step4Learn({ onComplete, isComplete }: Step4LearnProps) {
  const [showChat, setShowChat] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [shelfWidth, setShelfWidth] = useState(DEFAULT_SHELF_WIDTH);
  const isDragging = useRef(false);
  const headerPortalRef = useRef<HTMLDivElement | null>(null);
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [scoreSavedForSession, setScoreSavedForSession] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Config editor state
  const [activeTab, setActiveTab] = useState<ShelfTab>("prompt");
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [editedTools, setEditedTools] = useState<string[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Version history state
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [expandedVersionPrompt, setExpandedVersionPrompt] = useState<string | null>(null);

  // Load version history
  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/config/sdk-tutor/versions");
      if (res.ok) {
        const data: ConfigVersion[] = await res.json();
        setVersions(data);
        setVersionsLoaded(true);
      }
    } catch {
      // silently fail
    }
  }, []);

  // Load quiz scores (scoped to current user server-side)
  useEffect(() => {
    async function loadScores() {
      try {
        const res = await fetch("/api/quiz-scores");
        if (res.ok) {
          const { data } = await res.json();
          if (data) setScores(data);
        }
      } catch {
        // Silent fail
      }
    }
    loadScores();
  }, []);

  // Load agent config when shelf opens
  useEffect(() => {
    if (!showAbout || config) return;

    async function loadConfig() {
      setConfigLoading(true);
      try {
        const res = await fetch("/api/agents/config/sdk-tutor");
        if (res.ok) {
          const data: AgentConfig = await res.json();
          setConfig(data);
          setEditedPrompt(data.systemPrompt);
          setEditedTools(data.allowedTools);
        }
      } catch {
        setConfigError("Failed to load config");
      } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, [showAbout, config]);

  const handleSaveConfig = useCallback(async () => {
    setConfigSaving(true);
    setConfigError(null);
    setConfigSaved(false);
    try {
      const res = await fetch("/api/agents/config/sdk-tutor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: editedPrompt,
          allowedTools: editedTools,
        }),
      });
      if (res.ok) {
        const data: AgentConfig = await res.json();
        setConfig(data);
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2000);
        // Refresh version history
        if (versionsLoaded) loadVersions();
      } else {
        const err = await res.json();
        setConfigError(err.error || "Failed to save");
      }
    } catch {
      setConfigError("Failed to save config");
    } finally {
      setConfigSaving(false);
    }
  }, [editedPrompt, editedTools, versionsLoaded, loadVersions]);

  const handleResetConfig = useCallback(async () => {
    setConfigSaving(true);
    setConfigError(null);
    try {
      const res = await fetch("/api/agents/config/sdk-tutor", {
        method: "DELETE",
      });
      if (res.ok) {
        const data: AgentConfig = await res.json();
        setConfig(data);
        setEditedPrompt(data.systemPrompt);
        setEditedTools(data.allowedTools);
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2000);
      }
    } catch {
      setConfigError("Failed to reset config");
    } finally {
      setConfigSaving(false);
    }
  }, []);

  const handleToolToggle = useCallback((toolName: string) => {
    setEditedTools((prev) =>
      prev.includes(toolName)
        ? prev.filter((t) => t !== toolName)
        : [...prev, toolName]
    );
  }, []);

  // Load versions on first History tab visit
  useEffect(() => {
    if (activeTab === "history" && !versionsLoaded) {
      loadVersions();
    }
  }, [activeTab, versionsLoaded, loadVersions]);

  // Expand a version to see its full prompt
  const handleExpandVersion = useCallback(async (versionId: string) => {
    if (expandedVersionId === versionId) {
      setExpandedVersionId(null);
      setExpandedVersionPrompt(null);
      return;
    }
    setExpandedVersionId(versionId);
    setExpandedVersionPrompt(null);
    try {
      const res = await fetch(`/api/agents/config/sdk-tutor/versions?id=${versionId}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedVersionPrompt(data.system_prompt);
      }
    } catch {
      setExpandedVersionPrompt("Failed to load prompt");
    }
  }, [expandedVersionId]);

  // Restore a version into the editor
  const handleRestoreVersion = useCallback((prompt: string) => {
    setEditedPrompt(prompt);
    setExpandedVersionId(null);
    setExpandedVersionPrompt(null);
    setActiveTab("prompt");
  }, []);

  // Handle quiz score detection from AgentChat
  const handleQuizScore = useCallback(async (score: number, total: number) => {
    if (activeSessionId && scoreSavedForSession === activeSessionId) return;

    try {
      const res = await fetch("/api/quiz-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, total, session_id: activeSessionId }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setScores((prev) => [data, ...prev]);
          if (activeSessionId) setScoreSavedForSession(activeSessionId);
        }
      }
    } catch {
      // Silent fail
    }
  }, [activeSessionId, scoreSavedForSession]);

  const handleSessionChange = useCallback((sessionId: string | null) => {
    setActiveSessionId(sessionId);
    setScoreSavedForSession(null);
  }, []);

  // Sync URL hash with chat overlay state
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "sdk-tutor") {
      setShowChat(true);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash !== "sdk-tutor") {
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

  const latestScore = scores[0] || null;

  const hasUnsavedChanges = config && (
    editedPrompt !== config.systemPrompt ||
    JSON.stringify(editedTools.slice().sort()) !== JSON.stringify(config.allowedTools.slice().sort())
  );

  return (
    <div>
      {/* Description */}
      <p className="text-sm text-[#666] mb-4 leading-relaxed">
        Test your knowledge of the Claude Agents SDK with an AI-powered quiz. The tutor
        researches the latest docs, then asks 5 interactive questions — with instant
        feedback and practical tips after each answer.
      </p>

      {/* Start Quiz button */}
      <button
        onClick={() => {
          setShowChat(true);
          window.history.pushState(null, "", "#sdk-tutor");
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#6B8F71]/30 bg-[#6B8F71]/5 text-[#6B8F71] text-sm font-medium hover:bg-[#6B8F71]/10 hover:border-[#6B8F71]/50 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={LEARN_ICON} />
        </svg>
        Start SDK Quiz
      </button>

      {/* Quiz History */}
      {scores.length > 0 && (
        <div className="mt-4 border border-[#E8E6E1] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8E6E1] bg-[#FAFAF8]">
            <span className="text-[10px] font-semibold text-[#6B8F71] uppercase tracking-[0.15em]">
              Quiz History
            </span>
          </div>

          {latestScore && (
            <div className="px-4 py-4 bg-[#6B8F71]/5 border-b border-[#E8E6E1]">
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl text-[#6B8F71] leading-none">
                  {latestScore.score}/{latestScore.total}
                </span>
                <div>
                  <p className="text-xs font-medium text-[#1C1C1C]">Latest Score</p>
                  <p className="text-[11px] text-[#999]">
                    {formatDate(latestScore.date)} at {formatTimestamp(latestScore.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {scores.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E8E6E1] last:border-b-0"
              >
                <span className="text-xs text-[#999] w-16 shrink-0">
                  {formatDate(s.date)}
                </span>
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: s.total }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-2 rounded-sm ${
                        i < s.score ? "bg-[#6B8F71]" : "bg-[#E8E6E1]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-[#1C1C1C] w-8 text-right">
                  {s.score}/{s.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <svg className="w-3.5 h-3.5 text-[#6B8F71] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={LEARN_ICON} />
              </svg>
              <span className="text-sm font-medium text-[#1C1C1C] truncate">
                SDK Tutor
              </span>
            </div>
            {/* Portal target for AgentChat header controls */}
            <div ref={headerPortalRef} className="ml-auto" />
            {/* Config toggle */}
            <button
              onClick={() => setShowAbout(!showAbout)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showAbout
                  ? "bg-[#6B8F71] text-white"
                  : "bg-[#F5F4F0] text-[#666] hover:bg-[#ECEAE5] hover:text-[#1C1C1C]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={CONFIG_ICON} />
                <path strokeLinecap="round" strokeLinejoin="round" d={CONFIG_ICON_INNER} />
              </svg>
              Config
            </button>
          </div>

          {/* Main content area — chat + optional shelf */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Chat area */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden px-4">
              <AgentChat
                agentId="sdk-tutor"
                apiEndpoint="/api/agents/sdk-tutor"
                storageKey="sdk-tutor-sessions"
                placeholder="Ask about the Claude Agents SDK..."
                emptyStateTitle="Claude Agents SDK Quiz"
                emptyStateDescription="I'll research the latest SDK docs, then quiz you with 5 interactive questions. Ready?"
                loadingText="Researching..."
                agentIcon={LEARN_ICON}
                agentName="SDK Tutor"
                variant="full"
                headerPortalRef={headerPortalRef}
                fileUpload={{
                  accept: "image/*",
                  maxSizeMB: 10,
                  endpoint: "/api/upload",
                }}
                starterPrompts={[
                  "Start today's quiz",
                  "Quiz me on advanced topics",
                  "What's new in the SDK?",
                ]}
                onQuizScore={handleQuizScore}
                onSessionChange={handleSessionChange}
              />
            </div>

            {/* Config shelf — slides in from right, draggable */}
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
                  <div className="h-full w-px bg-[#E8E6E1] group-hover:bg-[#6B8F71] group-active:bg-[#6B8F71] transition-colors" />
                </div>
              <div className="flex-1 flex flex-col overflow-hidden pl-3">
                {/* Shelf header */}
                <div className="flex items-center gap-3 p-5 pb-4 border-b border-[#E8E6E1] shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#6B8F71]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#6B8F71]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={CONFIG_ICON} />
                      <path strokeLinecap="round" strokeLinejoin="round" d={CONFIG_ICON_INNER} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1C1C1C]">Agent Config</h3>
                    <p className="text-[11px] text-[#999]">
                      {config?.isOverride ? "Custom override active" : "Using defaults"}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E8E6E1] shrink-0">
                  {(["prompt", "tools", "history", "info"] as ShelfTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                        activeTab === tab
                          ? "text-[#6B8F71] border-b-2 border-[#6B8F71]"
                          : "text-[#999] hover:text-[#666]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  {configLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-5 h-5 border-2 border-[#6B8F71]/30 border-t-[#6B8F71] rounded-full animate-spin" />
                    </div>
                  ) : configError && !config ? (
                    <div className="p-5 text-sm text-red-600">{configError}</div>
                  ) : (
                    <>
                      {/* Prompt tab */}
                      {activeTab === "prompt" && (
                        <div className="flex flex-col h-full">
                          <textarea
                            value={editedPrompt}
                            onChange={(e) => setEditedPrompt(e.target.value)}
                            className="flex-1 w-full p-4 text-[12px] leading-relaxed font-mono text-[#1C1C1C] bg-[#FAFAF8] border-0 resize-none focus:outline-none focus:ring-0 min-h-[300px]"
                            spellCheck={false}
                          />
                        </div>
                      )}

                      {/* Tools tab */}
                      {activeTab === "tools" && (
                        <div className="p-4 space-y-2">
                          {ALL_TOOLS.map((tool) => (
                            <label
                              key={tool.name}
                              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={editedTools.includes(tool.name)}
                                onChange={() => handleToolToggle(tool.name)}
                                className="mt-0.5 w-4 h-4 rounded border-[#E8E6E1] text-[#6B8F71] focus:ring-[#6B8F71]/30"
                              />
                              <div>
                                <span className="text-xs font-semibold text-[#1C1C1C]">{tool.name}</span>
                                <p className="text-[11px] text-[#666] mt-0.5">{tool.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* History tab */}
                      {activeTab === "history" && (
                        <div className="p-4 space-y-2">
                          {versions.length === 0 && versionsLoaded && (
                            <p className="text-xs text-[#999] text-center py-8">No versions yet. Save a config to start tracking history.</p>
                          )}
                          {!versionsLoaded && (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-5 h-5 border-2 border-[#6B8F71]/30 border-t-[#6B8F71] rounded-full animate-spin" />
                            </div>
                          )}
                          {versions.map((v) => (
                            <div key={v.id} className="border border-[#E8E6E1] rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleExpandVersion(v.id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[#FAFAF8] transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                      v.source === "ui"
                                        ? "bg-[#6B8F71]/10 text-[#6B8F71]"
                                        : v.source === "code"
                                          ? "bg-blue-50 text-blue-600"
                                          : "bg-gray-100 text-gray-500"
                                    }`}>
                                      {v.source}
                                    </span>
                                    <span className="text-[11px] text-[#999]">
                                      {new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      {" "}
                                      {new Date(v.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  {v.note && (
                                    <p className="text-[11px] text-[#666] mt-1 truncate">{v.note}</p>
                                  )}
                                </div>
                                <svg className={`w-3.5 h-3.5 text-[#999] shrink-0 transition-transform ${expandedVersionId === v.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {expandedVersionId === v.id && (
                                <div className="border-t border-[#E8E6E1]">
                                  {expandedVersionPrompt === null ? (
                                    <div className="flex items-center justify-center py-6">
                                      <div className="w-4 h-4 border-2 border-[#6B8F71]/30 border-t-[#6B8F71] rounded-full animate-spin" />
                                    </div>
                                  ) : (
                                    <>
                                      <pre className="p-3 text-[11px] leading-relaxed font-mono text-[#555] bg-[#FAFAF8] max-h-64 overflow-y-auto whitespace-pre-wrap">{expandedVersionPrompt}</pre>
                                      <div className="p-2 border-t border-[#E8E6E1] bg-white">
                                        <button
                                          onClick={() => handleRestoreVersion(expandedVersionPrompt)}
                                          className="w-full py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-[0.1em] bg-[#6B8F71]/10 text-[#6B8F71] hover:bg-[#6B8F71]/20 transition-colors"
                                        >
                                          Restore this version
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Info tab */}
                      {activeTab === "info" && (
                        <div className="p-5 space-y-5">
                          {INFO_SECTIONS.map((section) => (
                            <div key={section.title}>
                              <h4 className="text-[10px] font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-2">
                                {section.title}
                              </h4>
                              <ul className="space-y-1.5">
                                {section.items.map((item, i) => (
                                  <li key={i} className="flex gap-2 text-[13px] text-[#555] leading-relaxed">
                                    <span className="text-[#6B8F71] shrink-0 mt-1.5">
                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                      </svg>
                                    </span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Save bar — shown on prompt and tools tabs */}
                {(activeTab === "prompt" || activeTab === "tools") && config && (
                  <div className="shrink-0 border-t border-[#E8E6E1] p-3 flex items-center gap-2">
                    <button
                      onClick={handleSaveConfig}
                      disabled={configSaving || !hasUnsavedChanges}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                        configSaved
                          ? "bg-[#6B8F71]/10 text-[#6B8F71]"
                          : hasUnsavedChanges
                            ? "bg-[#6B8F71] text-white hover:bg-[#5A7D60]"
                            : "bg-[#F5F4F0] text-[#999] cursor-not-allowed"
                      }`}
                    >
                      {configSaving ? "Saving..." : configSaved ? "Saved" : "Save"}
                    </button>
                    {config.isOverride && (
                      <button
                        onClick={handleResetConfig}
                        disabled={configSaving}
                        className="py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] border border-[#E8E6E1] text-[#666] hover:bg-[#FAFAF8] transition-colors"
                      >
                        Reset
                      </button>
                    )}
                    {configError && (
                      <p className="text-[11px] text-red-500">{configError}</p>
                    )}
                  </div>
                )}
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
          className="mt-3 w-full px-4 py-2.5 rounded-lg bg-[#6B8F71] text-white text-sm font-medium hover:bg-[#5A7D60] transition-colors duration-200"
        >
          Mark Learning Complete
        </button>
      )}

      {isComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full py-2.5 text-center rounded-lg bg-[#6B8F71]/5 hover:bg-[#6B8F71]/10 transition-colors"
        >
          <p className="text-sm text-[#6B8F71] font-medium">Learning complete! (click to undo)</p>
        </button>
      )}
    </div>
  );
}
