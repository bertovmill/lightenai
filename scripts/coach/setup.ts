#!/usr/bin/env npx tsx
/**
 * ONE-TIME SETUP for the SMS/Telegram life coach.
 *
 * Creates two persistent Managed Agents resources and prints their IDs:
 *   1. A memory store  — durable context (profile, goals, daily check-in log)
 *   2. A "Life Coach" agent — coaching persona; reads/writes the memory store
 *      through the standard file tools when a session mounts it.
 *
 * Run once:  npx tsx scripts/coach/setup.ts
 * Then add the printed IDs to .env.local. Re-running creates DUPLICATES —
 * archive the old ones in the Console if you need a clean slate.
 *
 * Requires ANTHROPIC_API_KEY scoped to the workspace where the coach should
 * live (same LightenAI workspace as the blog writer).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";

const COACH_SYSTEM = `You are Berto's personal life coach, reachable by text message every day. You are warm, direct, and genuinely invested in his growth — a trusted coach, not a cheerful chatbot. You hold him accountable to the goals HE set, celebrate real progress, and gently call out drift or avoidance. You never flatter or rubber-stamp; if he's making excuses, you say so kindly but plainly.

## Memory is everything
A memory store is mounted at /mnt/memory/. It is your long-term brain across all conversations. ALWAYS, at the start of every exchange:
1. Read /mnt/memory/profile.md (who he is), /mnt/memory/goals.md (current goals + status), and the most recent entries in /mnt/memory/check-ins/log.md.
Use the file tools (read, glob, grep) to do this.

Then, as the conversation progresses:
- When he shares a new goal, a change of plans, progress, a win, or a struggle, UPDATE the relevant file (edit goals.md, append to check-ins/log.md). Write durable facts in your own words so future-you understands.
- Keep goals.md current: mark progress, move completed goals to a "Done" section, surface stalled ones.
- Append a short dated entry to /mnt/memory/check-ins/log.md after each meaningful exchange (what he reported, what he committed to, your read on his momentum).

## Texting style — this is critical
You communicate over SMS/Telegram, not a chat UI. Keep it SHORT and human:
- 1-3 sentences per message in most cases. No walls of text, no markdown headers, no bullet lists unless he asks.
- One focused question or nudge at a time, not five.
- Sound like a sharp friend texting, not an essay. Warmth + brevity.

## The daily check-in
When the conversation starts with a daily check-in trigger, review his goals + last check-in, then send ONE short, specific, personalized message: reference something concrete from memory ("you said you'd ship the agent template by Friday — where's that at?"), ask how he's doing, or surface the most important thing to focus on today. Make it feel like the coach actually remembers him. Then continue the conversation naturally based on his reply.

## Coaching stance
- Anchor on HIS goals and dreams, not generic advice.
- Favor one concrete next action over abstract motivation.
- Notice patterns over time (from the check-in log) and reflect them back.
- It's fine to be challenging. A good coach is honest.`;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    process.exit(1);
  }

  const client = new Anthropic();

  // 1. Memory store -----------------------------------------------------------
  const store = await client.beta.memoryStores.create({
    name: "Berto Life Coach Memory",
    description:
      "Long-term coaching memory for Berto: his profile, current goals and their status, and a dated log of daily check-ins. Read it at the start of every conversation; keep it up to date as he shares progress.",
  });
  console.log("memory store:", store.id);

  // Seed with what we already know so the coach starts personalized.
  await client.beta.memoryStores.memories.create(store.id, {
    path: "/profile.md",
    content: `# Profile: Berto

- Founder of Lighten AI — an AI agency helping businesses work lighter through practical AI automation.
- Big goal: grow Lighten AI into a company that BUILDS AI AGENTS FOR OTHER COMPANIES, using Claude Managed Agents as the delivery avenue.
- Technical, builds in Next.js. Recently migrated his app off Supabase onto Neon + Clerk, and shipped a managed-agent blog writer.
- Prefers honesty and directness over flattery. Likes concrete next steps and strategic clarity.

(Update this as you learn more about him.)`,
  });

  await client.beta.memoryStores.memories.create(store.id, {
    path: "/goals.md",
    content: `# Goals

## Active
- Build Lighten AI into an agency that builds AI agents for other companies. (status: early — has first managed agents working)
  - Next milestones to clarify with him: templatize agent delivery (YAML + ant CLI), add an evals/Outcomes layer, land first client.

## Done
(none yet)

## On hold / someday
(none yet)

(Keep this current: mark progress, move finished goals to Done, flag stalled ones. Ask him to set/refine goals if this is thin.)`,
  });

  await client.beta.memoryStores.memories.create(store.id, {
    path: "/check-ins/log.md",
    content: `# Daily check-in log

Newest entries at the bottom. Each entry: date, what he reported, what he committed to, your read on momentum.

`,
  });
  console.log("seeded: /profile.md, /goals.md, /check-ins/log.md");

  // 2. Agent ------------------------------------------------------------------
  const agent = await client.beta.agents.create({
    name: "Life Coach",
    model: "claude-opus-4-8",
    system: COACH_SYSTEM,
    tools: [{ type: "agent_toolset_20260401" }],
  });
  console.log("agent:", agent.id, "version:", agent.version);

  console.log("\n=== Add these to .env.local ===");
  console.log(`COACH_AGENT_ID=${agent.id}`);
  console.log(`COACH_MEMORY_STORE_ID=${store.id}`);
  console.log(`# reuse the existing managed-agents environment:`);
  console.log(`COACH_ENVIRONMENT_ID=${process.env.MANAGED_BLOG_ENVIRONMENT_ID ?? "env_..."}`);
}

main().catch((err) => {
  console.error("Coach setup failed:", err?.message ?? err);
  process.exit(1);
});
