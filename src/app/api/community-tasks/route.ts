import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communityTasks } from "@/db/schema";
import { getUserId } from "@/lib/auth";

// GET — list the current user's community tasks (oldest first).
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await db
      .select()
      .from(communityTasks)
      .where(eq(communityTasks.user_id, userId))
      .orderBy(asc(communityTasks.created_at));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("community-tasks GET error:", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

// POST — create a task { title } scoped to the current user.
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title } = await request.json();
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  try {
    const [task] = await db
      .insert(communityTasks)
      .values({ title: title.trim(), user_id: userId })
      .returning();
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("community-tasks POST error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PATCH — toggle is_completed by id (own rows only).
export async function PATCH(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, is_completed } = await request.json();
  if (!id || typeof is_completed !== "boolean") {
    return NextResponse.json(
      { error: "id and is_completed are required" },
      { status: 400 }
    );
  }
  try {
    const [task] = await db
      .update(communityTasks)
      .set({ is_completed })
      .where(and(eq(communityTasks.id, id), eq(communityTasks.user_id, userId)))
      .returning();
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("community-tasks PATCH error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE — remove a task by ?id= (own rows only).
export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    await db
      .delete(communityTasks)
      .where(and(eq(communityTasks.id, id), eq(communityTasks.user_id, userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("community-tasks DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
