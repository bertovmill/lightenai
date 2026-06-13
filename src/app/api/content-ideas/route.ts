import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentIdeas } from "@/db/schema";
import { isCurrentUserAdmin } from "@/lib/auth";

// GET — list non-completed ideas, newest first.
export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await db
      .select()
      .from(contentIdeas)
      .where(eq(contentIdeas.completed, false))
      .orderBy(desc(contentIdeas.created_at));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("content-ideas GET error:", error);
    return NextResponse.json({ error: "Failed to load ideas" }, { status: 500 });
  }
}

// PATCH — mark an idea completed by { id }.
export async function PATCH(request: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    const [idea] = await db
      .update(contentIdeas)
      .set({ completed: true })
      .where(eq(contentIdeas.id, id))
      .returning();
    return NextResponse.json({ data: idea });
  } catch (error) {
    console.error("content-ideas PATCH error:", error);
    return NextResponse.json({ error: "Failed to update idea" }, { status: 500 });
  }
}

// DELETE — remove an idea by ?id=.
export async function DELETE(request: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    await db.delete(contentIdeas).where(eq(contentIdeas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("content-ideas DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 });
  }
}

// Quick-capture endpoint for the homepage "drop an idea" widget.
// Replaces the old direct supabase.from("content_ideas").insert() browser call.
export async function POST(request: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await request.json();
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    const [idea] = await db
      .insert(contentIdeas)
      .values({
        title: title.trim(),
        description:
          typeof description === "string" && description.trim() ? description.trim() : null,
      })
      .returning();

    return NextResponse.json({ data: idea });
  } catch (error) {
    console.error("content-ideas insert error:", error);
    return NextResponse.json({ error: "Failed to save idea" }, { status: 500 });
  }
}
