import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyProgress } from "@/db/schema";
import { getUserId } from "@/lib/auth";

// GET — current user's progress row for ?date=YYYY-MM-DD. Returns { data: { progress } | null }.
export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  try {
    const [row] = await db
      .select({ progress: dailyProgress.progress })
      .from(dailyProgress)
      .where(
        and(eq(dailyProgress.user_id, userId), eq(dailyProgress.date, date))
      )
      .limit(1);
    return NextResponse.json({ data: row ?? null });
  } catch (error) {
    console.error("daily-progress GET error:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}

// PUT — upsert { date, progress } for the current user.
export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { date, progress } = await request.json();
  if (!date || typeof progress !== "object" || progress === null) {
    return NextResponse.json(
      { error: "date and progress are required" },
      { status: 400 }
    );
  }
  try {
    const now = new Date().toISOString();
    const values = {
      user_id: userId,
      date,
      progress,
      updated_at: now,
    };
    const [row] = await db
      .insert(dailyProgress)
      .values(values)
      .onConflictDoUpdate({
        target: [dailyProgress.user_id, dailyProgress.date],
        set: { progress, updated_at: now },
      })
      .returning();
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("daily-progress PUT error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
