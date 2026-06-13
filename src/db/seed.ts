// Seed initial content: the "AI Agents" column + "Vercel Agents vs Claude Agents"
// topic and its per-platform posts (ported from the old Supabase seed SQL).
// Run with: npm run db:seed
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "./index";
import { columns, topics, posts } from "./schema";

const WEBSITE_BODY = `# Vercel AI SDK vs Claude Agent SDK: Which One Should You Build With?

*The agent era is here. Two of the most important tools for building AI agents just got major upgrades — but they solve very different problems. Here's how to think about them.*

---

If you're building anything with AI right now, you've probably come across two names over and over: **Vercel's AI SDK** and **Anthropic's Claude Agent SDK**.

Both let you build AI agents. Both support tool use and MCP. Both are open source. But they're built for fundamentally different jobs — and choosing the wrong one will cost you time.

We've been building AI agents for businesses at Lighten AI, and we use both. Here's our honest breakdown.

---

## What They Are (In Plain English)

**Vercel AI SDK 6** is a TypeScript toolkit for building AI-powered web applications. Think: chatbots, AI features inside your Next.js app, streaming UI components. It's model-agnostic — you can plug in Claude, GPT, Gemini, whatever. The new Agent abstraction in v6 lets you define reusable agents with tools, instructions, and type-safe streaming right into your frontend.

**Claude Agent SDK** is Anthropic's toolkit for building autonomous, long-running agents powered by Claude. Think: an agent that can execute shell commands, manage files, search documentation, and complete multi-step workflows on its own. It's purpose-built for Claude and deeply integrated with Claude's reasoning capabilities.

---

## The Key Difference

Here's the simplest way to think about it:

- **Vercel AI SDK** = Build AI *into* your app
- **Claude Agent SDK** = Build agents that *do work* autonomously

Vercel is about the interface. Claude is about the autonomy.

---

## Our Take

There's no "winner" here. These tools complement each other.

If you're a product team building AI into a web app, start with Vercel AI SDK. If you're automating business operations and need agents that actually do work end-to-end, start with Claude Agent SDK.

If you're us — building custom AI agents for businesses — you use both.

*We're Lighten AI. We build custom AI agents that take work off your plate so you can focus on what you do best.*`;

async function seed() {
  console.log("Seeding content…");

  const [column] = await db
    .insert(columns)
    .values({
      title: "AI Agents",
      slug: "ai-agents",
      description:
        "Deep dives into AI agent frameworks, patterns, and real-world applications.",
      sort_order: 0,
    })
    .onConflictDoNothing({ target: columns.slug })
    .returning();

  if (!column) {
    console.log("Column 'ai-agents' already exists — skipping seed.");
    return;
  }

  const [topic] = await db
    .insert(topics)
    .values({
      column_id: column.id,
      title: "Vercel Agents vs Claude Agents",
      slug: "vercel-agents-vs-claude-agents",
      description:
        "An honest comparison of Vercel AI SDK 6 and Anthropic's Claude Agent SDK — when to use each, and why the answer is often both.",
      author: "Lighten AI",
      published_date: "2026-01-15",
      sort_order: 0,
    })
    .returning();

  await db.insert(posts).values([
    {
      topic_id: topic.id,
      platform: "website",
      title: "Vercel AI SDK vs Claude Agent SDK: Which One Should You Build With?",
      body: WEBSITE_BODY,
      excerpt:
        "An honest comparison of Vercel AI SDK 6 and Anthropic's Claude Agent SDK — when to use each, and why the answer is often both.",
      status: "published",
      published_at: new Date().toISOString(),
    },
    {
      topic_id: topic.id,
      platform: "x",
      title: "Vercel AI SDK 6 vs Claude Agent SDK Thread",
      excerpt:
        "Vercel AI SDK 6 vs Claude Agent SDK — which should you actually build with? I use both every day. Here's the honest breakdown.",
      status: "draft",
    },
    {
      topic_id: topic.id,
      platform: "medium",
      title: "Vercel AI SDK vs Claude Agent SDK: Which One Should You Build With?",
      excerpt:
        "Both let you build AI agents. Both support tool use and MCP. But they're built for fundamentally different jobs.",
      status: "draft",
    },
    {
      topic_id: topic.id,
      platform: "linkedin",
      title: "The AI Agent Landscape Just Got Clearer",
      excerpt:
        "Two major frameworks are leading the charge for building AI agents in 2026. We use both at Lighten AI — here's how we think about the difference.",
      status: "draft",
    },
    {
      topic_id: topic.id,
      platform: "instagram",
      title: "Vercel Agents vs Claude Agents — Which One Should You Use?",
      excerpt:
        "Neither wins. They solve different problems. Vercel for the interface, Claude for the autonomy.",
      status: "draft",
    },
    {
      topic_id: topic.id,
      platform: "youtube",
      title: "Vercel Agents vs Claude Agents — Which Should You Use?",
      excerpt:
        "Both let you build AI agents. Both are open source. But they solve completely different problems.",
      status: "draft",
    },
  ]);

  console.log("✓ Seeded 1 column, 1 topic, 6 posts.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
