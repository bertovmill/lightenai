import { config } from "dotenv";
config({ path: ".env.local" });
const { default: Anthropic } = await import("@anthropic-ai/sdk");
const client = new Anthropic();
const AGENT = process.env.COACH_AGENT_ID, ENV = process.env.COACH_ENVIRONMENT_ID, STORE = process.env.COACH_MEMORY_STORE_ID;

const session = await client.beta.sessions.create({
  agent: AGENT, environment_id: ENV, title: "robin test",
  resources: [{ type: "memory_store", memory_store_id: STORE, access: "read_write", instructions: "Berto's coaching memory. Read profile/goals/check-ins first." }],
});

const texts = [];
const stream = await client.beta.sessions.events.stream(session.id);
await client.beta.sessions.events.send(session.id, {
  events: [{ type: "user.message", content: [{ type: "text", text: "[DAILY CHECK-IN] It's a new day. Review my goals and last check-in, then send me a short personal check-in text." }] }],
});

for await (const ev of stream) {
  if (ev.type === "agent.custom_tool_use" && ev.name === "send_text") {
    texts.push(ev.input?.message);
    await client.beta.sessions.events.send(session.id, { events: [{ type: "user.custom_tool_result", custom_tool_use_id: ev.id, content: [{ type: "text", text: "delivered" }] }] });
  }
  if (ev.type === "session.status_terminated") break;
  if (ev.type === "session.status_idle" && ev.stop_reason?.type !== "requires_action") break;
}
console.log("=== TEXTS ROBIN WOULD SEND (" + texts.length + ") ===");
texts.forEach((t,i) => console.log(`[${i+1}] ${t}`));
await client.beta.sessions.archive(session.id).catch(()=>{});
