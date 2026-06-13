/**
 * Runs one turn of the SMS life coach against the managed agent.
 *
 * - Keeps ONE rolling session per phone (stored in coach_sessions), so texting
 *   is a continuous conversation; the memory store is the long-term backbone.
 * - Collects the coach's user-facing messages from the `send_text` custom tool
 *   so tool-narration / memory writes never reach the user's phone. Falls back
 *   to plain agent.message text if the agent didn't use the tool.
 */
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coachSessions } from "@/db/schema";

const AGENT_ID = process.env.COACH_AGENT_ID;
const ENVIRONMENT_ID = process.env.COACH_ENVIRONMENT_ID;
const MEMORY_STORE_ID = process.env.COACH_MEMORY_STORE_ID;

const MEMORY_INSTRUCTIONS =
  "Berto's coaching memory. Read /profile.md, /goals.md and the latest /check-ins/log.md before responding; update them as he shares progress.";

function client() {
  return new Anthropic();
}

async function getStoredSession(phone: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(coachSessions)
    .where(eq(coachSessions.phone, phone))
    .limit(1);
  return row?.session_id ?? null;
}

async function storeSession(phone: string, sessionId: string): Promise<void> {
  await db
    .insert(coachSessions)
    .values({ phone, session_id: sessionId, updated_at: new Date().toISOString() })
    .onConflictDoUpdate({
      target: coachSessions.phone,
      set: { session_id: sessionId, updated_at: new Date().toISOString() },
    });
}

/** Resume the phone's rolling session, or create a fresh one with memory mounted. */
async function getOrCreateSession(c: Anthropic, phone: string): Promise<string> {
  if (!AGENT_ID || !ENVIRONMENT_ID || !MEMORY_STORE_ID) {
    throw new Error("COACH_AGENT_ID / COACH_ENVIRONMENT_ID / COACH_MEMORY_STORE_ID not set");
  }

  let sid = await getStoredSession(phone);
  if (sid) {
    try {
      const s = await c.beta.sessions.retrieve(sid);
      if (s.status === "terminated") sid = null;
    } catch {
      sid = null;
    }
  }
  if (sid) return sid;

  const session = await c.beta.sessions.create({
    agent: AGENT_ID,
    environment_id: ENVIRONMENT_ID,
    title: `Coach: ${phone}`,
    resources: [
      {
        type: "memory_store",
        memory_store_id: MEMORY_STORE_ID,
        access: "read_write",
        instructions: MEMORY_INSTRUCTIONS,
      },
    ],
  });
  await storeSession(phone, session.id);
  return session.id;
}

/**
 * Send `text` into the coach (as the user `phone`) and return the messages it
 * wants delivered. `phone` is the recipient/identity for the rolling session.
 */
export async function runCoachTurn(phone: string, text: string): Promise<string[]> {
  const c = client();
  const sessionId = await getOrCreateSession(c, phone);

  const messages: string[] = [];
  let fallback = "";

  const stream = await c.beta.sessions.events.stream(sessionId);
  await c.beta.sessions.events.send(sessionId, {
    events: [{ type: "user.message", content: [{ type: "text", text }] }],
  });

  for await (const event of stream as AsyncIterable<Record<string, unknown>>) {
    const type = event.type as string;

    if (type === "agent.custom_tool_use" && event.name === "send_text") {
      const input = event.input as { message?: string } | undefined;
      const msg = input?.message;
      if (typeof msg === "string" && msg.trim()) messages.push(msg.trim());
      // Acknowledge so the agent can continue.
      await c.beta.sessions.events.send(sessionId, {
        events: [
          {
            type: "user.custom_tool_result",
            custom_tool_use_id: event.id as string,
            content: [{ type: "text", text: "delivered" }],
          },
        ],
      });
    } else if (type === "agent.message") {
      // Fallback only — used if the agent forgets to call send_text.
      const blocks = (event.content as Array<{ type?: string; text?: string }>) ?? [];
      for (const b of blocks) if (b.type === "text" && b.text) fallback += b.text;
    } else if (type === "session.status_terminated") {
      break;
    } else if (type === "session.status_idle") {
      const stop = (event.stop_reason as { type?: string })?.type;
      if (stop !== "requires_action") break;
    }
  }

  if (messages.length === 0 && fallback.trim()) messages.push(fallback.trim());
  return messages;
}
