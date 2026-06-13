import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { columns, topics, posts } from "@/db/schema";

const TABLES = { column: columns, topic: topics, post: posts } as const;

/**
 * POST /api/content
 * Create a column, topic, or post.
 * Body: { type: "column" | "topic" | "post", data: { ... } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "type and data are required" },
        { status: 400 }
      );
    }

    const table = TABLES[type as keyof typeof TABLES];

    if (!table) {
      return NextResponse.json(
        { error: "type must be column, topic, or post" },
        { status: 400 }
      );
    }

    const result = await db.insert(table).values(data).returning();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/content
 * Update a column, topic, or post.
 * Body: { type: "column" | "topic" | "post", id: string, data: { ... } }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: "type, id, and data are required" },
        { status: 400 }
      );
    }

    const table = TABLES[type as keyof typeof TABLES];

    if (!table) {
      return NextResponse.json(
        { error: "type must be column, topic, or post" },
        { status: 400 }
      );
    }

    // If publishing a post, auto-set published_at
    if (type === "post" && data.status === "published" && !data.published_at) {
      data.published_at = new Date().toISOString();
    }

    const result = await db
      .update(table)
      .set(data)
      .where(eq(table.id, id))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
