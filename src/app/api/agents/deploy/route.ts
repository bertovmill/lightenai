import { NextRequest } from "next/server";
import { db } from "@/db";
import { deployedAgents } from "@/db/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const EXTRACTION_PROMPT = `You are a structured data extractor. Given an Agent Spec document (markdown), extract the following fields as JSON. Be precise — use the document content directly. If a field isn't in the document, use a sensible default.

Return ONLY valid JSON with these fields:
{
  "agent_id": "url-safe-slug (lowercase, hyphens, no spaces)",
  "name": "Agent display name",
  "tagline": "One-line tagline",
  "description": "2-3 sentence description",
  "icon_path": "SVG path data string for a 24x24 icon (pick one that matches the agent's purpose from common Heroicons paths, or use the default sparkle icon)",
  "status": "active",
  "capabilities": [
    { "title": "Capability Name", "description": "What it does", "icon": "SVG path data" }
  ],
  "faq": [
    { "question": "Question?", "answer": "Answer." }
  ],
  "placeholder": "Chat input placeholder text",
  "empty_state_title": "Title shown when chat is empty",
  "empty_state_description": "Description shown when chat is empty",
  "loading_text": "Text shown while agent is thinking",
  "starter_prompts": ["Prompt 1", "Prompt 2", "Prompt 3"],
  "system_prompt": "The full system prompt for the agent (extract from the spec's system prompt / persona / instructions section)",
  "allowed_tools": ["Read", "Glob", "Grep", "WebSearch", "WebFetch", "AskUserQuestion"],
  "agents": null,
  "permission_mode": "bypassPermissions",
  "architecture": null
}

For capabilities, generate 3-4 based on what the agent does. For FAQ, generate 3-4 relevant questions and answers. For the system_prompt, extract or synthesize the agent's instructions, persona, and behavioral rules from the spec.

If the spec mentions subagents/sub-agents, populate the "agents" field as a JSON object matching the Claude Agents SDK format:
{
  "agent-name": {
    "description": "What this subagent does",
    "prompt": "System prompt for the subagent",
    "tools": ["Tool1", "Tool2"]
  }
}

If the spec mentions an architecture (orchestrator pattern, pipeline, etc.), populate "architecture" as an array of layers:
[
  { "nodes": [{ "label": "Name", "type": "orchestrator", "description": "..." }] },
  { "nodes": [{ "label": "Name", "type": "agent", "description": "..." }] },
  { "nodes": [{ "label": "Output", "type": "result", "description": "..." }] }
]`;

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

export async function POST(request: NextRequest) {
  const { specMarkdown, userId } = await request.json();

  if (!specMarkdown) {
    return Response.json({ error: "specMarkdown is required" }, { status: 400 });
  }

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    // Use Claude to extract structured fields from the spec markdown
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\n---\n\nAgent Spec Document:\n\n${specMarkdown}`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", errText);
      return Response.json({ error: "Failed to extract agent data" }, { status: 500 });
    }

    const anthropicData = await anthropicRes.json();
    const textBlock = anthropicData.content?.find(
      (b: AnthropicContentBlock) => b.type === "text"
    );
    if (!textBlock?.text) {
      return Response.json({ error: "Failed to extract agent data" }, { status: 500 });
    }

    // Parse the JSON from Claude's response
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse extracted JSON" }, { status: 500 });
    }

    const extracted = JSON.parse(jsonMatch[0]);

    // Upsert into deployed_agents
    const values = {
      agent_id: extracted.agent_id,
      name: extracted.name,
      tagline: extracted.tagline || "",
      description: extracted.description || "",
      icon_path: extracted.icon_path || undefined,
      status: extracted.status || "active",
      capabilities: extracted.capabilities || [],
      faq: extracted.faq || [],
      architecture: extracted.architecture || null,
      placeholder: extracted.placeholder || "Send a message...",
      empty_state_title: extracted.empty_state_title || "Start a conversation",
      empty_state_description: extracted.empty_state_description || "",
      loading_text: extracted.loading_text || "Thinking...",
      starter_prompts: extracted.starter_prompts || [],
      system_prompt: extracted.system_prompt || "",
      allowed_tools: extracted.allowed_tools || ["Read", "Glob", "Grep", "WebSearch", "WebFetch", "AskUserQuestion"],
      agents: extracted.agents || null,
      permission_mode: extracted.permission_mode || "bypassPermissions",
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    const [data] = await db
      .insert(deployedAgents)
      .values(values)
      .onConflictDoUpdate({ target: deployedAgents.agent_id, set: values })
      .returning();

    return Response.json({
      success: true,
      agent_id: extracted.agent_id,
      name: extracted.name,
      url: `/agents/${extracted.agent_id}`,
      data,
    });
  } catch (err) {
    console.error("Deploy error:", err);
    return Response.json(
      { error: "Failed to deploy agent", details: String(err) },
      { status: 500 }
    );
  }
}
