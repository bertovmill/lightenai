"use client";

import Link from "next/link";
import { chapters, LearnLayout } from "./components";

export default function LearnIndex() {
  return (
    <LearnLayout>
      <div className="mb-12">
        <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-2">Claude Agents SDK</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Learn to Build AI Agents
        </h1>
        <p className="text-lg text-[#666] max-w-2xl">
          Master the Claude Agents SDK with our comprehensive guide. Learn to build AI agents that can read files, write code, run commands, and complete complex tasks autonomously.
        </p>
      </div>

      {/* Chapters Grid */}
      <div className="grid gap-4">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/learn/${chapter.id}`}
            className="group bg-white border border-[#E8E6E1] rounded-xl p-6 hover:border-[#5F9468]/40 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-[#F5F5F3] group-hover:bg-[#5F9468] group-hover:text-white flex items-center justify-center text-lg font-medium transition-colors shrink-0">
                {chapter.number}
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-[#5F9468] transition-colors">
                  {chapter.title}
                </h2>
                <p className="text-sm text-[#888]">
                  {getChapterDescription(chapter.id)}
                </p>
              </div>
              <svg className="w-5 h-5 text-[#999] group-hover:text-[#5F9468] group-hover:translate-x-1 transition-all shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Start CTA */}
      <div className="mt-12 bg-gradient-to-br from-[#5F9468]/10 to-[#D4E5D7]/20 border border-[#5F9468]/20 rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Ready to start building?</h3>
        <p className="text-[#666] mb-6">Jump straight into the quickstart guide and build your first agent.</p>
        <Link
          href="/learn/quickstart"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5F9468] text-white font-medium rounded-lg hover:bg-[#4F8357] transition-colors"
        >
          Start Building
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </LearnLayout>
  );
}

function getChapterDescription(id: string): string {
  const descriptions: Record<string, string> = {
    "what-is-agents-sdk": "Understand what the Claude Agents SDK is and see it in action with an interactive code example.",
    "quickstart": "Set up your environment and build your first AI agent in minutes.",
    "agent-sdk": "Deep dive into the core functions: query(), tool(), and createSdkMcpServer().",
    "types": "TypeScript type definitions including Options, McpServerConfig, and more.",
    "capabilities": "Explore built-in tools, hooks, subagents, MCP, permissions, and sessions.",
    "claude-code-features": "Learn about skills, slash commands, memory, and plugins.",
    "get-started": "Step-by-step setup guide and comparison with other Claude tools.",
    "permissions": "Control how your agent uses tools with permission modes, hooks, and allow/deny rules.",
    "user-input": "Surface Claude's approval requests and clarifying questions to users.",
    "hooks": "Intercept and control tool execution with pre and post tool use hooks.",
    "structured-outputs": "Get typed, validated responses using JSON schemas and Zod.",
    "session-management": "Continue conversations across interactions with session resumption and forking.",
    "checkpointing": "Track file changes during agent sessions and restore files to any previous state.",
  };
  return descriptions[id] || "";
}
