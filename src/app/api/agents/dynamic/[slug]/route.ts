import { runAgentInSandbox } from "@/lib/agents/sandbox";
import { db } from "@/db";
import { deployedAgents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { message, history = [], imageAttachments } = await request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Load agent config from the database
  const [agent] = await db
    .select()
    .from(deployedAgents)
    .where(eq(deployedAgents.agent_id, slug))
    .limit(1);

  if (!agent) {
    return new Response(JSON.stringify({ error: "Agent not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stream = await runAgentInSandbox(message, history, {
      imageAttachments,
      allowedTools: agent.allowed_tools || ["Read", "Glob", "Grep", "WebSearch", "WebFetch", "AskUserQuestion"],
      permissionMode: agent.permission_mode || "bypassPermissions",
      agents: (agent.agents as Record<string, unknown>) || undefined,
      systemPrompt: agent.system_prompt || `You are ${agent.name}, an AI assistant.`,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error(`Dynamic agent (${slug}) error:`, err);
    return new Response(
      JSON.stringify({ error: "Failed to start agent", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
