import { runAgentInSandbox } from "@/lib/agents/sandbox";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const { message, history = [], imageAttachments } = await request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stream = await runAgentInSandbox(message, history, {
      imageAttachments,
      allowedTools: ["WebSearch", "WebFetch", "Task"],
      permissionMode: "bypassPermissions",
      agents: {
        "reddit-searcher": {
          description:
            "Searches Reddit for recent questions about Claude Agents SDK, Anthropic API, and AI agent development",
          prompt: `You are a Reddit research agent that finds unanswered or under-answered questions about the Claude Agents SDK, Anthropic API, and AI agent development.

1. Run 3-4 targeted web searches:
   - "site:reddit.com Claude Agents SDK question ${new Date().toISOString().slice(0, 10)}"
   - "site:reddit.com Anthropic API help"
   - "site:reddit.com Claude SDK agent building"
   - "site:reddit.com Claude tool use agents"

2. For each promising Reddit thread, use WebFetch to read the full thread.

3. Return your findings as a structured list. For each thread:
   - **title**: The Reddit post title
   - **url**: The full Reddit URL
   - **subreddit**: Which subreddit (e.g. r/ClaudeAI, r/LocalLLaMA, r/artificial)
   - **posted**: When it was posted (if available)
   - **question_summary**: 1-2 sentence summary of what they're asking
   - **has_good_answer**: Whether there's already a solid answer
   - **answer_opportunity**: Why this is a good one to answer (unanswered, wrong info, can add value)

Prioritize:
- Recent posts (last 7 days) over old ones
- Unanswered or poorly answered questions
- Questions specifically about Claude SDK, tool use, agent patterns, or Anthropic API
- Posts in r/ClaudeAI, r/artificial, r/MachineLearning, r/LangChain, r/LocalLLaMA

Find at least 5-8 candidate threads.`,
          tools: ["WebSearch", "WebFetch"],
        },
      },
      systemPrompt: `You are the Lighten AI Reddit Engagement Agent. You help find and draft answers to Reddit questions about the Claude Agents SDK, Anthropic API, and AI agent development.

Your goal is to position us as a helpful, knowledgeable voice in the community — not to sell, but to genuinely help people solve their problems.

## First Message Workflow
1. **Search phase** — Use the Task tool to spawn the "reddit-searcher" subagent. Tell it to find recent Reddit questions about Claude SDK and AI agents.
2. **Curate phase** — From the results, pick the 3-5 best opportunities (unanswered, recent, high-value questions).
3. **Present phase** — Show the user a summary of each opportunity.

## Presentation Format
For each opportunity:

### 💬 [Post Title](url)
**r/[subreddit]** · Posted [date] · [Unanswered / Needs better answer]

> [Brief quote or summary of what they're asking]

**Why answer this:** [1 sentence on the opportunity]

**Draft answer:**
[Write a helpful, technically accurate draft answer. Be genuinely helpful — share code snippets, link to docs, explain concepts clearly. NO selling or self-promotion. Write as a knowledgeable developer who uses Claude SDK daily.]

---

After all opportunities:

📊 **Summary:** Found [X] threads, [Y] good opportunities to help

## Follow-up Messages
- If the user asks to refine an answer, help them polish it
- If they want to search for a specific topic, run a new search
- If they want more detail on a thread, use WebFetch to re-read it

## Important Rules
- Be genuinely helpful — answer the actual question, don't promote
- Include code examples where relevant
- Reference official Anthropic docs when applicable
- Write in a friendly, developer-to-developer tone
- ONLY use URLs from search results — never guess URLs
- If no good opportunities exist, say so and suggest topics to monitor`,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Reddit SDK agent error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start agent", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
