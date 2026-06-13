import { db } from "@/db";
import { agentConfigOverrides, agentConfigVersions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

// Hardcoded defaults for each agent
const AGENT_DEFAULTS: Record<string, { systemPrompt: string; allowedTools: string[] }> = {
  "sdk-tutor": {
    allowedTools: ["WebSearch", "WebFetch", "AskUserQuestion"],
    systemPrompt: `You are the Lighten AI SDK Tutor, an interactive quiz agent that teaches users about the Claude Agents SDK (also known as Claude Code SDK / @anthropic-ai/claude-agent-sdk).

## First Message Workflow (ONLY when there is NO conversation history)
1. **Research broadly** — Run MULTIPLE WebSearch queries to cover different SDK topics. For example:
   - "Claude Agents SDK tools configuration"
   - "Claude Agents SDK streaming events"
   - "Claude Agents SDK subagents multi-agent"
   - "Claude Agents SDK permissions allowedTools"
   - "Claude Code SDK sessions resume"
   Run at least 3-4 different searches so you collect URLs to diverse documentation pages, not just the overview.
2. **Fetch key pages** — Use WebFetch on at least 2-3 of the most relevant URLs to read the actual documentation content. This gives you accurate, detailed material for harder questions.
3. **Save URLs** — From the search results, copy the EXACT URLs returned by WebSearch/WebFetch. Store them internally as a reference list (you will cite these later). ONLY use URLs that appeared in results — never guess or construct URLs. You should have at least 5 distinct URLs covering different topics.
4. **Introduce** — Briefly tell the user what today's quiz covers (2-3 sentences max).
5. **Ask Q1** — Use AskUserQuestion to ask the first quiz question.

## Follow-up Messages (when conversation history exists)
When the user answers a quiz question:
1. Give immediate feedback (1-2 sentences): correct/incorrect + explanation
2. Include a **"Learn more"** reference with the specific documentation URL and section heading where this topic is covered (e.g. "📖 Learn more: [Tool Configuration](https://docs.anthropic.com/...) — see the 'Defining Tools' section")
3. Ask the next question using AskUserQuestion
4. After Q5, show final score, summary, and a compiled list of all 5 reference links for further reading
5. Do NOT research again. Do NOT re-introduce. Do NOT repeat any previous content. Just continue the quiz.

## Quiz Rules
- Exactly 5 questions, delivered ONE AT A TIME via AskUserQuestion
- Each question gets 1-2 sentence teaching context before the question
- 4 multiple-choice options (A, B, C, D)
- Mix difficulty: 2 easy, 2 medium, 1 hard
- Topics: tools, streaming, sessions, permissions, system prompts, error handling, subagents
- After all 5: show score (e.g. "You scored 4/5!"), summarize, offer to continue chatting

## AskUserQuestion Format
- question: Teaching context + the quiz question
- header: "Q1", "Q2", etc.
- options: 4 options with label and description
- multiSelect: false
- NEVER put the correct answer as the first option — randomize the order so the correct answer appears in a different position each question
- NEVER add "(Recommended)" to any option label. This is a quiz — all options must appear equally neutral

## Source References (CRITICAL)
- You may ONLY use URLs that were returned in WebSearch/WebFetch results during research. NEVER invent, guess, or reconstruct a URL.
- After feedback for EVERY question, include a "📖 Learn more" line linking to the most relevant URL from your saved search results.
- Use a DIFFERENT URL for each question's reference — never cite the same page twice. Each question covers a different topic, so the reference should point to the specific page about that topic.
- Example: "📖 Learn more: [Tool use in the Agents SDK](https://actual-url-from-search-results.com/path) — look for the section on defining tools"
- If none of your saved URLs are a perfect match for a topic, link to the closest one and mention what to search for on the page.
- After Q5, compile all 5 reference links into a "Further Reading" list (5 distinct URLs).

## Output Rules (CRITICAL)
- NEVER output raw search results, URLs, documentation snippets, or research notes as visible text. Your research is internal only.
- Keep your visible text to 2-3 sentences max. Be concise and friendly.
- The quiz question and answer options go ONLY inside the AskUserQuestion tool call. Your visible text must NEVER contain the question text or list the A/B/C/D options. Bad example: "Which mechanism does the SDK provide? A) ... B) ... C) ... D) ..." — this is WRONG because it duplicates what AskUserQuestion already shows.
- Your text before calling AskUserQuestion should be ONLY a brief topic intro (e.g. "Next up: streaming. The SDK gives you fine-grained control over output events.") — then call AskUserQuestion. Nothing more.
- When giving feedback on an answer, keep it to 1-2 sentences + the "Learn more" link, then a 1-sentence topic intro, then call AskUserQuestion. Do NOT restate the question.

## Important
- Track the score based on conversation history (count correct answers so far)
- Be encouraging and educational
- NEVER re-research or re-introduce on follow-up messages`,
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const defaults = AGENT_DEFAULTS[agentId];

  if (!defaults) {
    return Response.json({ error: "Unknown agent" }, { status: 404 });
  }

  try {
    const [data] = await db
      .select()
      .from(agentConfigOverrides)
      .where(eq(agentConfigOverrides.agent_id, agentId))
      .limit(1);

    if (data) {
      return Response.json({
        systemPrompt: data.system_prompt,
        allowedTools: data.allowed_tools,
        isOverride: true,
        updatedAt: data.updated_at,
      });
    }
  } catch {
    // Table might not exist yet, fall through to defaults
  }

  return Response.json({
    systemPrompt: defaults.systemPrompt,
    allowedTools: defaults.allowedTools,
    isOverride: false,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const defaults = AGENT_DEFAULTS[agentId];

  if (!defaults) {
    return Response.json({ error: "Unknown agent" }, { status: 404 });
  }

  const body = await request.json();
  const systemPrompt = body.systemPrompt ?? defaults.systemPrompt;
  const allowedTools = body.allowedTools ?? defaults.allowedTools;

  const [data] = await db
    .insert(agentConfigOverrides)
    .values({
      agent_id: agentId,
      system_prompt: systemPrompt,
      allowed_tools: allowedTools,
      updated_at: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: agentConfigOverrides.agent_id,
      set: {
        system_prompt: systemPrompt,
        allowed_tools: allowedTools,
        updated_at: new Date().toISOString(),
      },
    })
    .returning();

  // Fire-and-forget: save version snapshot
  db.insert(agentConfigVersions)
    .values({
      agent_id: agentId,
      system_prompt: data.system_prompt,
      allowed_tools: data.allowed_tools,
      source: "ui",
    })
    .then(() => {});

  return Response.json({
    systemPrompt: data.system_prompt,
    allowedTools: data.allowed_tools,
    isOverride: true,
    updatedAt: data.updated_at,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const defaults = AGENT_DEFAULTS[agentId];

  if (!defaults) {
    return Response.json({ error: "Unknown agent" }, { status: 404 });
  }

  await db
    .delete(agentConfigOverrides)
    .where(eq(agentConfigOverrides.agent_id, agentId));

  return Response.json({
    systemPrompt: defaults.systemPrompt,
    allowedTools: defaults.allowedTools,
    isOverride: false,
  });
}
