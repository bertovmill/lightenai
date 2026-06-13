"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllAgents } from "@/lib/agents/data";
import { AgentConfig } from "@/lib/agents/types";
import { AnimateIn } from "../components/AnimateIn";

export default function Agents() {
  const [agents, setAgents] = useState<AgentConfig[]>(getAllAgents());

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: AgentConfig[]) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch(() => {
        // Keep static agents on error
      });
  }, []);

  return (
    <main className="flex-1 py-12">
      <AnimateIn animation="fade-up">
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-3">AI Agents</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-[#1C1C1C]">
            Agents
          </h1>
          <p className="text-[#666] max-w-2xl">
            Explore and interact with AI agents built on the Claude Agents SDK.
          </p>
        </div>
      </AnimateIn>

      {/* Agent cards */}
      <AnimateIn animation="fade-up" delay={100}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group bg-white border border-[#E8E6E1] rounded-2xl p-6 hover:border-[#5F9468]/50 transition-all hover:shadow-lg hover:shadow-[#5F9468]/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5F9468]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={agent.iconPath} />
                  </svg>
                </div>
                {agent.status === "active" && (
                  <span className="flex items-center gap-1.5 text-xs text-[#888]">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#1C1C1C] group-hover:text-[#5F9468] transition-colors">
                {agent.name}
              </h3>
              <p className="text-sm text-[#666]">
                {agent.description}
              </p>
            </Link>
          ))}

          {/* Add new agent card */}
          <div className="bg-[#FAFAF8] border border-dashed border-[#D5D3CE] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[180px] hover:border-[#999] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#E8E6E1] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm text-[#999]">Add new agent</p>
          </div>
        </div>
      </AnimateIn>

      {/* Case Study Section */}
      <AnimateIn animation="fade-up" delay={200}>
        <div className="mt-20 pt-16 border-t border-[#E8E6E1]">
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-3">Case Study</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-[#1C1C1C]">
              See Scout in Action
            </h2>
            <p className="text-[#666] max-w-2xl">
              How a multi-agent research system turns hours of manual work into minutes.
            </p>
          </div>

          <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden">
            {/* Problem / Solution */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E8E6E1]">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-red-600">The Problem</h3>
                </div>
                <p className="text-sm text-[#555] leading-relaxed">
                  Financial analysts spend 4-5 hours daily on manual company research — sifting through
                  news articles, SEC filings, market reports, and competitor data. Information gets stale
                  before reports are even finished.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-emerald-700">The Solution</h3>
                </div>
                <p className="text-sm text-[#555] leading-relaxed">
                  Scout breaks research into subtopics, runs parallel web-researcher agents across
                  multiple sources simultaneously, fact-checks key claims, and synthesizes everything
                  into a structured, sourced report.
                </p>
              </div>
            </div>

            {/* Architecture diagram */}
            <div className="border-t border-[#E8E6E1] p-6">
              <p className="text-xs font-medium text-[#999] mb-4">Architecture</p>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-[#5F9468]/10 border border-[#5F9468]/30 rounded-xl px-4 py-2 text-sm font-medium text-[#5F9468]">
                  Scout Orchestrator
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-[#D5D3CE]" />
                  <svg className="w-3 h-3 text-[#999]" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M6 9L1.5 4.5h9L6 9z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-[#F5F4F0] border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-xs text-[#555]">
                    web-researcher
                  </div>
                  <div className="bg-[#F5F4F0] border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-xs text-[#555]">
                    web-researcher
                  </div>
                  <div className="bg-[#F5F4F0] border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-xs text-[#555]">
                    web-researcher
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-[#D5D3CE]" />
                  <svg className="w-3 h-3 text-[#999]" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M6 9L1.5 4.5h9L6 9z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-[#F5F4F0] border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-xs text-[#555]">
                    fact-checker
                  </div>
                  <div className="bg-[#F5F4F0] border border-[#E8E6E1] rounded-xl px-3 py-1.5 text-xs text-[#555]">
                    synthesizer
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-[#D5D3CE]" />
                  <svg className="w-3 h-3 text-[#999]" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M6 9L1.5 4.5h9L6 9z" />
                  </svg>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm font-medium text-emerald-700">
                  Structured Research Report
                </div>
              </div>
            </div>

            {/* Result stat */}
            <div className="border-t border-[#E8E6E1] p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#999] mb-1">Research time reduction</p>
                <p className="text-2xl font-bold text-[#5F9468]">4-5 hours → minutes</p>
              </div>
              <Link
                href="/agents/scout"
                className="px-4 py-2 bg-[#5F9468] text-white font-semibold rounded-xl hover:bg-[#4F8357] transition-colors text-sm"
              >
                Try Scout →
              </Link>
            </div>
          </div>
        </div>
      </AnimateIn>
    </main>
  );
}
