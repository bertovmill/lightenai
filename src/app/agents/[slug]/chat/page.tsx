"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getAgentBySlug } from "@/lib/agents/data";
import { useState, useEffect } from "react";
import { AgentConfig } from "@/lib/agents/types";
import AgentChat from "@/app/components/agents/AgentChat";

export default function AgentChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [agent, setAgent] = useState<AgentConfig | null>(getAgentBySlug(slug) || null);
  const [loading, setLoading] = useState(!agent);

  useEffect(() => {
    if (agent) return;
    fetch(`/api/agents?slug=${slug}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: AgentConfig | null) => {
        if (data) setAgent(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, agent]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-[#888] text-sm">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#fafafa] mb-2">Agent not found</h1>
          <p className="text-[#888] mb-4">The agent &ldquo;{slug}&rdquo; doesn&apos;t exist.</p>
          <Link href="/agents" className="text-[#5F9468] hover:underline text-sm">Back to agents</Link>
        </div>
      </div>
    );
  }

  return (
    <AgentChat
      agentId={agent.id}
      apiEndpoint={agent.chatConfig.apiEndpoint}
      storageKey={agent.chatConfig.storageKey}
      placeholder={agent.chatConfig.placeholder}
      emptyStateTitle={agent.chatConfig.emptyStateTitle}
      emptyStateDescription={agent.chatConfig.emptyStateDescription}
      loadingText={agent.chatConfig.loadingText}
      agentIcon={agent.iconPath}
      agentName={agent.name}
      variant="full"
      starterPrompts={agent.chatConfig.starterPrompts}
      fileUpload={agent.chatConfig.fileUpload}
    />
  );
}
