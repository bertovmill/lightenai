import { db } from "@/db";
import { agentConfigVersions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get("id");

  // Single version with full content
  if (versionId) {
    const [data] = await db
      .select()
      .from(agentConfigVersions)
      .where(
        and(
          eq(agentConfigVersions.id, versionId),
          eq(agentConfigVersions.agent_id, agentId)
        )
      )
      .limit(1);

    if (!data) {
      return Response.json({ error: "Version not found" }, { status: 404 });
    }

    return Response.json(data);
  }

  // List versions (omit full prompt for speed)
  const data = await db
    .select({
      id: agentConfigVersions.id,
      agent_id: agentConfigVersions.agent_id,
      source: agentConfigVersions.source,
      note: agentConfigVersions.note,
      allowed_tools: agentConfigVersions.allowed_tools,
      created_at: agentConfigVersions.created_at,
    })
    .from(agentConfigVersions)
    .where(eq(agentConfigVersions.agent_id, agentId))
    .orderBy(desc(agentConfigVersions.created_at))
    .limit(50);

  return Response.json(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const body = await request.json();

  const { systemPrompt, allowedTools, source, note } = body;

  if (!systemPrompt) {
    return Response.json({ error: "systemPrompt is required" }, { status: 400 });
  }

  const [data] = await db
    .insert(agentConfigVersions)
    .values({
      agent_id: agentId,
      system_prompt: systemPrompt,
      allowed_tools: allowedTools ?? [],
      source: source ?? "api",
      note: note ?? null,
    })
    .returning();

  return Response.json(data, { status: 201 });
}
