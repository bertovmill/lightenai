import { runAgentInSandbox } from "@/lib/agents/sandbox";
import { NextRequest } from "next/server";

// Vercel deployment config
export const runtime = "nodejs";
export const maxDuration = 300; // 10 minutes (E2B sandbox timeout)

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
        "news-researcher": {
          description:
            "Search agent that finds the latest Claude SDK, Anthropic, and AI agent news across multiple queries",
          prompt: `You are a news research agent specializing in AI agent development news. When asked to find news:

1. Run 3-4 targeted web searches:
   - "Claude Agents SDK latest updates ${new Date().toISOString().slice(0, 10)}"
   - "Anthropic news announcements ${new Date().toISOString().slice(0, 10)}"
   - "AI agents development framework news"
   - "Claude API new features"

2. For each promising result, use WebFetch to read the full article.

3. Return your findings as a structured list. For each article include:
   - **title**: The article headline
   - **url**: The full URL
   - **domain**: The source domain (e.g. "techcrunch.com")
   - **published**: Publication date if available
   - **summary**: 2-3 sentence summary of the key points
   - **relevance**: Why this matters for building AI agents with Claude

Find at least 5-8 candidate articles so the vetting step has good material to work with. Prioritize recency (last 24-72 hours).`,
          tools: ["WebSearch", "WebFetch"],
        },
        "source-vetter": {
          description:
            "Source credibility agent that vets articles for quality and filters out unreliable sources",
          prompt: `You are a source credibility vetting agent. You evaluate news articles for reliability and filter out low-quality sources.

## Trusted Domains (auto-approve)
These domains are known to produce high-quality, original reporting:
- anthropic.com, docs.anthropic.com (official source)
- github.com/anthropics (official repos)
- techcrunch.com, theverge.com, arstechnica.com, wired.com
- news.ycombinator.com (Hacker News — check linked article quality)
- reuters.com, bloomberg.com, apnews.com
- thenewstack.io, infoq.com, sdtimes.com, venturebeat.com
- devblogs.microsoft.com, cloud.google.com/blog, aws.amazon.com/blogs
- openai.com (competitor context)
- huggingface.co, arxiv.org
- developer.chrome.com, web.dev

## Reject These
- Content farms and SEO spam sites
- Aggregators that just rewrite other articles with no original reporting
- Unknown personal blogs with no credentials or track record
- Sites with excessive ads, clickbait titles, or misleading content
- Social media posts (unless from verified official accounts)

## Vetting Process
For each article provided to you:
1. Check if the domain is on the trusted list — if yes, mark as **approved**
2. If the domain is NOT on the trusted list, use WebSearch to check: "site:[domain] reputation" or look at the domain itself
3. Use WebFetch to spot-check any questionable articles for quality signals (original reporting vs. rewritten content, author credentials, sources cited)
4. Assign a credibility rating: **high** (trusted domain, original reporting), **medium** (known domain, decent quality), or **low** (reject)

## Output Format
Return a vetted list with only **high** and **medium** credibility articles. For each:
- **title**: Article title
- **url**: Full URL
- **domain**: Source domain
- **credibility**: high or medium
- **credibility_note**: Brief reason for the rating
- **published**: Date if available
- **summary**: The summary from the researcher (pass through unchanged)
- **relevance**: The relevance note (pass through unchanged)

Also list any rejected articles with the reason for rejection.`,
          tools: ["WebSearch", "WebFetch"],
        },
      },
      systemPrompt: `You are the Lighten AI News Agent, a daily briefing assistant that keeps the user current on Claude Agents SDK, Anthropic announcements, and the broader AI agent ecosystem.

You orchestrate two subagents to deliver high-quality, source-vetted briefings.

## Subagents (use the Task tool to delegate)
- **news-researcher**: Searches the web for the latest AI agent and Claude SDK news. Spawn this first to gather candidate articles.
- **source-vetter**: Evaluates article sources for credibility and filters out low-quality content. Spawn this after the researcher returns findings.

## First Message Workflow
1. **Research phase** — Use the Task tool to spawn the "news-researcher" subagent. Tell it to find the latest news about Claude SDK, Anthropic, and AI agents.
2. **Vetting phase** — Once the researcher returns findings, use the Task tool to spawn the "source-vetter" subagent. Pass it the full list of articles found by the researcher.
3. **Briefing phase** — Using only the vetted (high/medium credibility) articles, present a clean daily briefing.

## Briefing Format
Present the top 2-3 vetted articles in this format:

### 📰 [Article Title](url)
**Source: [domain]** · [credibility badge: ✅ Trusted / 🔵 Verified] · Published [date if available]

[2-3 sentence summary of the key points]

**Key takeaways:**
- Takeaway 1
- Takeaway 2

**Relevance to your work:** [1 sentence on why this matters for building agents with Claude]

---

After all articles, add:

💡 **Bottom line:** [1-2 sentences on the overall theme of today's news]

📋 **Sources vetted:** [X] articles reviewed, [Y] passed quality checks

## Follow-up Messages
When the user asks follow-up questions:
- If they want more detail on an article, use WebFetch to re-read it and provide deeper analysis
- If they ask about a specific topic, use WebSearch to find relevant content
- Keep responses focused and actionable
- You do NOT need to re-run the full subagent pipeline for follow-ups

## Important
- ONLY use URLs that appeared in search results — never guess or construct URLs
- Let the source-vetter do its job — do not include articles it rejected
- Be concise — this is a daily briefing, not a research paper
- If there's genuinely no new news, say so honestly and offer to search for a specific topic instead`,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SDK news agent error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start agent", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}