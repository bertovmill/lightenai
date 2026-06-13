import { NextRequest } from "next/server";
import { query, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { allTools } from "@/lib/agents/data-analyst/tools";
import { SYSTEM_PROMPT } from "@/lib/agents/data-analyst/prompt";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

function buildPromptWithHistory(
  message: string,
  history: ConversationMessage[]
): { prompt: string; systemPrompt: string } {
  let augmented = SYSTEM_PROMPT;

  if (history.length === 0) {
    return { prompt: message, systemPrompt: augmented };
  }

  const transcript = history
    .map(
      (msg) =>
        `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    )
    .join("\n\n");

  augmented += `

## CRITICAL: Conversation History
You are CONTINUING an existing conversation. The transcript below shows what has already been said. You MUST:
- Continue naturally from exactly where the conversation left off
- Do NOT repeat any content you already said
- Do NOT re-run your initial workflow (no re-listing tables, no re-introducing yourself)
- Do NOT use tools unless the user's new message specifically requires new information
- Respond DIRECTLY to the user's latest message in context of the conversation

<conversation_history>
${transcript}
</conversation_history>`;

  return { prompt: message, systemPrompt: augmented };
}

export async function POST(request: NextRequest) {
  const { message, history = [] } = await request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt, systemPrompt } = buildPromptWithHistory(message, history);

  const mcpServer = createSdkMcpServer({
    name: "database",
    tools: allTools,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      const processedAssistantIds = new Set<string>();
      const sentLines = new Set<string>();
      let sentAskUserQuestion = false;

      try {
        // Send initial input event
        sendEvent({
          type: "input",
          rawInput: {
            prompt: message,
            options: { systemPrompt: "..." },
          },
        });

        const agentStream = query({
          prompt,
          options: {
            systemPrompt,
            mcpServers: { database: mcpServer },
            permissionMode: "bypassPermissions",
            allowDangerouslySkipPermissions: true,
            maxTurns: 15,
          },
        });

        for await (const msg of agentStream) {
          if (sentAskUserQuestion) continue;

          // Session init
          if (
            msg.type === "system" &&
            (msg as Record<string, unknown>).subtype === "init" &&
            (msg as Record<string, unknown>).session_id
          ) {
            sendEvent({
              type: "session",
              sessionId: (msg as Record<string, unknown>).session_id,
            });
          }

          // Assistant messages
          if (
            msg.type === "assistant" &&
            (msg as Record<string, unknown>).message
          ) {
            const message = (msg as Record<string, unknown>).message as {
              id?: string;
              content: Array<{
                type: string;
                text?: string;
                name?: string;
                id?: string;
                input?: Record<string, unknown>;
              }>;
            };
            const msgId = message.id;

            if (msgId && processedAssistantIds.has(msgId)) {
              sendEvent({ type: "raw", rawMessage: msg });
              continue;
            }
            if (msgId) processedAssistantIds.add(msgId);

            for (const block of message.content) {
              if (block.type === "text" && block.text) {
                // Line-level dedup
                const lines = block.text.split("\n");
                const novelLines: string[] = [];
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.length > 40 && sentLines.has(trimmed)) {
                    continue;
                  }
                  if (trimmed.length > 40) {
                    sentLines.add(trimmed);
                  }
                  novelLines.push(line);
                }
                const novelText = novelLines.join("\n");
                if (novelText.replace(/\s+/g, "").length > 0) {
                  sendEvent({ type: "text", text: novelText, rawMessage: msg });
                }
              } else if (
                block.type === "tool_use" &&
                block.name === "AskUserQuestion"
              ) {
                sendEvent({
                  type: "ask_user_question",
                  toolUseId: block.id,
                  questions: block.input?.questions || [],
                  rawMessage: msg,
                });
                sentAskUserQuestion = true;
                break;
              } else if (block.type === "tool_use") {
                let status = "";
                switch (block.name) {
                  case "list_tables":
                    status = "Listing tables...";
                    break;
                  case "describe_table":
                    status = `Inspecting table schema...`;
                    break;
                  case "query_table":
                    status = "Querying data...";
                    break;
                  case "count_rows":
                    status = "Counting rows...";
                    break;
                  default:
                    status = `Using ${block.name}...`;
                    break;
                }
                if (status) {
                  sendEvent({ type: "thinking_step", step: status });
                  sendEvent({ type: "status", status });
                }
              }
            }
          } else {
            if (msg.type === "result") {
              sendEvent({ type: "status", status: "Thinking..." });
            }
            sendEvent({ type: "raw", rawMessage: msg });
          }
        }

        sendEvent({ type: "complete" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("[data-analyst] Stream error:", error);
        sendEvent({
          type: "error",
          error: "An error occurred",
          rawError: String(error),
        });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
