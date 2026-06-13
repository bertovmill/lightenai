/**
 * Bridge between Anthropic Managed Agents and the AgentChat SSE contract.
 *
 * Unlike the E2B path (src/lib/agents/sandbox.ts), the agent loop AND the tool
 * container run on Anthropic's infrastructure. We just create/reuse a session
 * against a pre-created managed agent, stream its events, and re-emit them in
 * the same `data: {json}\n\n` shape that AgentChat already understands
 * (`session`, `status`, `text`, `thinking`, `tool_call`, `tool_result`,
 * `document_update`, `complete`, `error`, then `[DONE]`).
 *
 * The agent + environment are persisted, versioned objects created once in the
 * Console — we only reference them by ID here. Never call agents.create() in the
 * request path.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ManagedAgentRunOptions {
  /** Reuse an existing (idle) session for multi-turn continuity. */
  sessionId?: string | null;
  /** Current editor content, surfaced to the agent as context on revisions. */
  documentContent?: string;
  title?: string;
}

const AGENT_ID = process.env.MANAGED_BLOG_AGENT_ID;
const ENVIRONMENT_ID = process.env.MANAGED_BLOG_ENVIRONMENT_ID;

function sseLine(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

function textOf(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .filter((b) => b && (b as { type?: string }).type === "text")
    .map((b) => (b as { text?: string }).text ?? "")
    .join("");
}

/**
 * Returns a ReadableStream of SSE bytes for a single user turn. Creates a fresh
 * session when no live sessionId is supplied, otherwise resumes the given one.
 */
export async function runManagedAgent(
  message: string,
  options: ManagedAgentRunOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!AGENT_ID || !ENVIRONMENT_ID) {
    throw new Error(
      "MANAGED_BLOG_AGENT_ID and MANAGED_BLOG_ENVIRONMENT_ID must be set"
    );
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(sseLine(data));
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      };

      try {
        // 1. Resume the session if the client handed one back, else create one.
        let sessionId = options.sessionId ?? null;
        if (sessionId) {
          // Resuming a terminated session 409s — fall back to a fresh one.
          try {
            const existing = await client.beta.sessions.retrieve(sessionId);
            if (existing.status === "terminated") sessionId = null;
          } catch {
            sessionId = null;
          }
        }

        if (!sessionId) {
          const session = await client.beta.sessions.create({
            agent: AGENT_ID,
            environment_id: ENVIRONMENT_ID,
            title: options.title?.slice(0, 200) || "Blog draft",
          });
          sessionId = session.id;
        }
        send({ type: "session", sessionId });
        send({ type: "status", status: "Working..." });

        // 2. Stream-first: open the stream BEFORE sending the kickoff so we
        //    don't miss the early events.
        const stream = await client.beta.sessions.events.stream(sessionId);

        const kickoff = options.documentContent
          ? `Here is the current draft the user is editing. Apply their request and return the full updated post.\n\n<current_document>\n${options.documentContent}\n</current_document>\n\n${message}`
          : message;

        await client.beta.sessions.events.send(sessionId, {
          events: [{ type: "user.message", content: [{ type: "text", text: kickoff }] }],
        });

        // 3. Re-emit events in the AgentChat contract; accumulate the post body
        //    so it can also land in a document editor if one is wired up.
        let postBody = "";

        for await (const event of stream as AsyncIterable<Record<string, unknown>>) {
          const type = event.type as string;

          if (type === "agent.message") {
            const text = textOf(event.content);
            if (text) {
              postBody += text;
              send({ type: "text", text });
            }
          } else if (type === "agent.thinking") {
            const text = textOf(event.content) || (event.thinking as string) || "";
            if (text) send({ type: "thinking", text });
          } else if (type === "agent.tool_use" || type === "agent.mcp_tool_use") {
            send({
              type: "tool_call",
              toolUseId: event.id,
              toolName: event.name,
              toolInput: event.input,
              status: "running",
              summary: `Using ${event.name}`,
            });
          } else if (type === "agent.tool_result" || type === "agent.mcp_tool_result") {
            send({
              type: "tool_result",
              toolUseId: event.tool_use_id,
              result: textOf(event.content),
              isError: !!event.is_error,
            });
            send({ type: "tool_call_complete", toolUseId: event.tool_use_id });
          } else if (type === "session.error") {
            send({
              type: "error",
              error:
                (event.error as { message?: string })?.message || "Agent error",
            });
          } else if (type === "session.status_terminated") {
            break;
          } else if (type === "session.status_idle") {
            const stop = (event.stop_reason as { type?: string })?.type;
            // requires_action = waiting on a tool confirmation / custom tool result.
            // This agent's tools auto-run, so any other stop reason is terminal.
            if (stop !== "requires_action") break;
          }
        }

        if (postBody.trim()) {
          send({ type: "document_update", content: postBody });
        }
        send({ type: "complete", allRawMessages: [] });
        close();
      } catch (err) {
        send({ type: "error", error: String(err) });
        close();
      }
    },
  });
}
