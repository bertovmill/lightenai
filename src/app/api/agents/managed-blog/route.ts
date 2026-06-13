import { runManagedAgent } from "@/lib/agents/managed-agent";
import { NextRequest } from "next/server";

// Anthropic hosts the agent loop + container, so this route only relays SSE.
export const runtime = "nodejs";
export const maxDuration = 300; // managed-agent turns can run for minutes

export async function POST(request: NextRequest) {
  const { message, sessionId, documentContent } = await request.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stream = await runManagedAgent(message, {
      sessionId,
      documentContent,
      title: message,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Managed blog agent error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start agent", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
