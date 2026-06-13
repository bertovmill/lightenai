import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { agentDocuments } from "@/db/schema";
import { getUserId } from "@/lib/auth";

// GET — current user's document for ?session_id=. Returns { data: { content } | null }.
export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }
  try {
    const [row] = await db
      .select({ content: agentDocuments.content })
      .from(agentDocuments)
      .where(
        and(
          eq(agentDocuments.user_id, userId),
          eq(agentDocuments.session_id, sessionId)
        )
      )
      .limit(1);
    return NextResponse.json({ data: row ?? null });
  } catch (error) {
    console.error("agent-documents GET error:", error);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}

// PUT — upsert { session_id, agent_id, content } for the current user.
export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { session_id, agent_id, content } = await request.json();
  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }
  try {
    const now = new Date().toISOString();
    const [row] = await db
      .insert(agentDocuments)
      .values({
        user_id: userId,
        session_id,
        agent_id: agent_id ?? "content-creator",
        content: content ?? "",
        updated_at: now,
      })
      .onConflictDoUpdate({
        target: [agentDocuments.user_id, agentDocuments.session_id],
        set: { content: content ?? "", updated_at: now },
      })
      .returning();
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("agent-documents PUT error:", error);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
