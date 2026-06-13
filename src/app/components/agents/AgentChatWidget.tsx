"use client";

import Link from "next/link";
import AgentChat from "./AgentChat";
import type { AgentConfig } from "@/lib/agents/types";

interface AgentChatWidgetProps {
  agent: AgentConfig;
}

export default function AgentChatWidget({ agent }: AgentChatWidgetProps) {
  return (
    <div>
      <AgentChat
        agentId={agent.id}
        apiEndpoint={agent.chatConfig.apiEndpoint}
        storageKey={`${agent.chatConfig.storageKey}-widget`}
        placeholder={agent.chatConfig.placeholder}
        emptyStateTitle={agent.chatConfig.emptyStateTitle}
        emptyStateDescription={agent.chatConfig.emptyStateDescription}
        loadingText={agent.chatConfig.loadingText}
        agentIcon={agent.iconPath}
        agentName={agent.name}
        variant="embedded"
        starterPrompts={agent.chatConfig.starterPrompts}
      />
      <div className="mt-3 text-center">
        <Link
          href={`/agents/${agent.id}/chat`}
          className="inline-flex items-center gap-2 text-sm text-[#5F9468] hover:underline"
        >
          Open full chat
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
