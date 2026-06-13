"use client";

import { useState } from "react";
import { FollowerPointerCard } from "./ui/following-pointer";

type Agent = {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
};

export function AgentsGrid({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {agents.map((agent) => (
        <AgentCard key={agent.name} agent={agent} />
      ))}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const [hovered, setHovered] = useState(false);

  return (
    <FollowerPointerCard
      title={agent.name}
      className="rounded-3xl"
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex flex-col gap-2 px-4 py-3.5 bg-white border border-[#E8E6E1] rounded-3xl hover:border-[#5F9468]/40 hover:shadow-md hover:shadow-[#5F9468]/8 transition-all duration-300"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#5F9468]/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={agent.icon} />
            </svg>
          </div>
          <span className="text-sm font-medium text-[#1C1C1C]">{agent.name}</span>
        </div>
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: hovered ? "80px" : "0px",
            opacity: hovered ? 1 : 0,
          }}
        >
          <p className="text-xs text-[#666] leading-relaxed pl-[42px]">
            {agent.description}
          </p>
        </div>
      </div>
    </FollowerPointerCard>
  );
}
