"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export const chapters = [
  { id: "what-is-agents-sdk", number: 1, title: "What is the Agents SDK?" },
  { id: "quickstart", number: 2, title: "Quickstart" },
  { id: "agent-sdk", number: 3, title: "The Agent SDK" },
  { id: "types", number: 4, title: "Types" },
  { id: "capabilities", number: 5, title: "Capabilities" },
  { id: "claude-code-features", number: 6, title: "Claude Code Features" },
  { id: "get-started", number: 7, title: "Get Started" },
  { id: "tools", number: 8, title: "Tools" },
  { id: "tool-outputs", number: 9, title: "Tool Outputs & Permissions" },
  { id: "other-types", number: 10, title: "Other Types" },
  { id: "streaming-input", number: 11, title: "Streaming Input" },
  { id: "permissions", number: 12, title: "Configure Permissions" },
  { id: "user-input", number: 13, title: "Handle Approvals & User Input" },
  { id: "hooks", number: 14, title: "Control Execution with Hooks" },
  { id: "structured-outputs", number: 15, title: "Structured Outputs" },
  { id: "session-management", number: 16, title: "Session Management" },
  { id: "checkpointing", number: 17, title: "File Checkpointing" },
];

// Searchable index with keywords for each topic
export const searchIndex = [
  // Chapters
  ...chapters.map(ch => ({
    title: ch.title,
    href: `/learn/${ch.id}`,
    category: "Chapter",
    keywords: [ch.title.toLowerCase(), ch.id.replace(/-/g, " ")]
  })),
  // Tools
  { title: "Bash", href: "/learn/tools", category: "Tool", keywords: ["bash", "command", "shell", "terminal", "execute"] },
  { title: "BashOutput", href: "/learn/tools", category: "Tool", keywords: ["bash output", "background", "shell output"] },
  { title: "Edit", href: "/learn/tools", category: "Tool", keywords: ["edit", "replace", "modify", "file edit", "string replacement"] },
  { title: "Read", href: "/learn/tools", category: "Tool", keywords: ["read", "file", "content", "text", "image", "pdf", "notebook"] },
  { title: "Write", href: "/learn/tools", category: "Tool", keywords: ["write", "create", "file", "save"] },
  { title: "Glob", href: "/learn/tools", category: "Tool", keywords: ["glob", "pattern", "find files", "match"] },
  { title: "Grep", href: "/learn/tools", category: "Tool", keywords: ["grep", "search", "regex", "find content", "ripgrep"] },
  { title: "KillBash", href: "/learn/tools", category: "Tool", keywords: ["kill", "stop", "terminate", "background shell"] },
  { title: "NotebookEdit", href: "/learn/tools", category: "Tool", keywords: ["notebook", "jupyter", "cell", "ipynb"] },
  { title: "WebFetch", href: "/learn/tools", category: "Tool", keywords: ["web", "fetch", "url", "http", "download"] },
  { title: "WebSearch", href: "/learn/tools", category: "Tool", keywords: ["web", "search", "query", "internet"] },
  { title: "TodoWrite", href: "/learn/tools", category: "Tool", keywords: ["todo", "task", "list", "progress"] },
  { title: "ExitPlanMode", href: "/learn/tools", category: "Tool", keywords: ["plan", "exit", "approve", "planning mode"] },
  { title: "ListMcpResources", href: "/learn/tools", category: "Tool", keywords: ["mcp", "resources", "list", "servers"] },
  { title: "ReadMcpResource", href: "/learn/tools", category: "Tool", keywords: ["mcp", "resource", "read", "uri"] },
  { title: "AskUserQuestion", href: "/learn/capabilities", category: "Tool", keywords: ["ask", "question", "user input", "clarify", "prompt"] },
  // Types
  { title: "Options", href: "/learn/types", category: "Type", keywords: ["options", "configuration", "query options", "settings"] },
  { title: "AgentDefinition", href: "/learn/types", category: "Type", keywords: ["agent", "definition", "subagent", "custom agent"] },
  { title: "HookCallback", href: "/learn/types", category: "Type", keywords: ["hook", "callback", "lifecycle", "pre tool", "post tool"] },
  { title: "CanUseTool", href: "/learn/types", category: "Type", keywords: ["permission", "can use tool", "authorize", "allow"] },
  // Sandbox
  { title: "SandboxSettings", href: "/learn/sandbox", category: "Config", keywords: ["sandbox", "security", "isolation", "safe mode"] },
  { title: "NetworkSandboxSettings", href: "/learn/sandbox", category: "Config", keywords: ["network", "sandbox", "proxy", "unix socket", "local binding"] },
  { title: "SandboxIgnoreViolations", href: "/learn/sandbox", category: "Config", keywords: ["ignore", "violations", "sandbox", "bypass"] },
  // Capabilities
  { title: "Hooks", href: "/learn/hooks", category: "Feature", keywords: ["hooks", "lifecycle", "pre tool", "post tool", "callback", "intercept", "control"] },
  { title: "PreToolUse Hook", href: "/learn/hooks", category: "Hook", keywords: ["pre tool use", "before tool", "block", "validate", "intercept"] },
  { title: "PostToolUse Hook", href: "/learn/hooks", category: "Hook", keywords: ["post tool use", "after tool", "log", "audit", "result"] },
  { title: "HookCallback", href: "/learn/hooks", category: "Hook", keywords: ["hook callback", "function", "handler", "permission decision"] },
  { title: "Subagents", href: "/learn/capabilities", category: "Feature", keywords: ["subagent", "task", "delegate", "spawn"] },
  { title: "MCP", href: "/learn/capabilities", category: "Feature", keywords: ["mcp", "model context protocol", "servers", "external"] },
  { title: "Permissions", href: "/learn/permissions", category: "Feature", keywords: ["permissions", "allow", "deny", "security", "access control"] },
  { title: "User Input & Approvals", href: "/learn/user-input", category: "Feature", keywords: ["user input", "approval", "canUseTool", "ask user question", "clarifying", "prompt"] },
  { title: "Sessions", href: "/learn/session-management", category: "Feature", keywords: ["session", "resume", "context", "history", "conversation", "fork", "session id"] },
  { title: "Structured Outputs", href: "/learn/structured-outputs", category: "Feature", keywords: ["structured", "outputs", "schema", "zod", "json", "typed", "validation"] },
  { title: "File Checkpointing", href: "/learn/checkpointing", category: "Feature", keywords: ["checkpoint", "rewind", "undo", "restore", "file changes", "rollback", "backup"] },
  // Output Types
  { title: "TaskOutput", href: "/learn/tool-outputs", category: "Output", keywords: ["task output", "result", "subagent result"] },
  { title: "BashOutput (type)", href: "/learn/tool-outputs", category: "Output", keywords: ["bash output", "stdout", "stderr", "exit code"] },
  { title: "ReadOutput", href: "/learn/tool-outputs", category: "Output", keywords: ["read output", "file content", "text", "image", "pdf"] },
  { title: "GrepOutput", href: "/learn/tool-outputs", category: "Output", keywords: ["grep output", "search results", "matches"] },
  { title: "GlobOutput", href: "/learn/tool-outputs", category: "Output", keywords: ["glob output", "file matches", "paths"] },
];

function SearchBox() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.length > 0
    ? searchIndex.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(k => k.includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-full pl-9 pr-12 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468]/50 transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#999] bg-[#F5F5F3] border border-[#E8E6E1] rounded">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8E6E1] rounded-lg shadow-xl overflow-hidden z-50">
          {results.map((item, index) => (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                index === selectedIndex
                  ? "bg-[#F5F5F3] text-[#1C1C1C]"
                  : "text-[#666] hover:bg-[#F5F5F3] hover:text-[#1C1C1C]"
              }`}
            >
              <span className="truncate">{item.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                item.category === "Tool" ? "bg-[#5F9468]/10 text-[#5F9468]" :
                item.category === "Type" ? "bg-[#5B7BAD]/10 text-[#5B7BAD]" :
                item.category === "Output" ? "bg-[#4A9D6E]/10 text-[#4A9D6E]" :
                item.category === "Config" ? "bg-[#C4645A]/10 text-[#C4645A]" :
                item.category === "Feature" ? "bg-[#8B5E9B]/10 text-[#8B5E9B]" :
                item.category === "Hook" ? "bg-[#A89540]/10 text-[#A89540]" :
                "bg-[#999]/10 text-[#888]"
              }`}>
                {item.category}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8E6E1] rounded-lg shadow-xl p-4 z-50">
          <p className="text-sm text-[#999] text-center">No results found</p>
        </div>
      )}
    </div>
  );
}

export function CodeBlock({ filename, children }: { filename: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C1C1C] border border-[#333] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#333]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-[#999]">{filename}</span>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto text-[#e5e5e5]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#5F9468] opacity-[0.06] blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#D4E5D7] opacity-[0.15] blur-[120px] rounded-full" />

      <Navigation />

      <div className="relative z-10 max-w-6xl mx-auto px-6 min-h-screen flex flex-col">
        {/* Mobile menu button */}
        <div className="lg:hidden flex justify-end py-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -mr-2 text-[#666] hover:text-[#1C1C1C] transition-colors"
            aria-label="Open chapters menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-72 bg-[#FAFAF8] border-l border-[#E8E6E1] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em]">
                  Menu
                </p>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-[#666] hover:text-[#1C1C1C] transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SearchBox />
              <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">
                Chapters
              </p>
              <nav>
                <ul className="space-y-2">
                  {chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <Link
                        href={`/learn/${chapter.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors group ${
                          pathname?.includes(chapter.id)
                            ? "text-[#1C1C1C] bg-[#5F9468]/10"
                            : "text-[#666] hover:text-[#1C1C1C] hover:bg-[#F5F5F3]"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          pathname?.includes(chapter.id)
                            ? "bg-[#5F9468] text-white"
                            : "bg-[#F5F5F3] group-hover:bg-[#5F9468] group-hover:text-white"
                        }`}>
                          {chapter.number}
                        </span>
                        <span>{chapter.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Main layout with sidebar */}
        <div className="flex gap-12 flex-1 pt-4 lg:pt-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-[100px]">
              <SearchBox />
              <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">
                Chapters
              </p>
              <ul className="space-y-1">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/learn/${chapter.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                        pathname?.includes(chapter.id)
                          ? "text-[#1C1C1C] bg-[#5F9468]/10"
                          : "text-[#666] hover:text-[#1C1C1C] hover:bg-[#F5F5F3]"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        pathname?.includes(chapter.id)
                          ? "bg-[#5F9468] text-white"
                          : "bg-[#F5F5F3] group-hover:bg-[#5F9468] group-hover:text-white"
                      }`}>
                        {chapter.number}
                      </span>
                      <span className="truncate">{chapter.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export function ChapterNavigation({ currentChapterId }: { currentChapterId: string }) {
  const currentIndex = chapters.findIndex(ch => ch.id === currentChapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="flex justify-between items-center mt-16 pt-8 border-t border-[#E8E6E1]">
      {prevChapter ? (
        <Link
          href={`/learn/${prevChapter.id}`}
          className="flex items-center gap-3 text-[#666] hover:text-[#1C1C1C] transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <div className="text-right">
            <p className="text-xs text-[#999]">Previous</p>
            <p className="text-sm">{prevChapter.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {nextChapter ? (
        <Link
          href={`/learn/${nextChapter.id}`}
          className="flex items-center gap-3 text-[#666] hover:text-[#1C1C1C] transition-colors group"
        >
          <div className="text-left">
            <p className="text-xs text-[#999]">Next</p>
            <p className="text-sm">{nextChapter.title}</p>
          </div>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
