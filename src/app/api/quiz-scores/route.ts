import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quizScores } from "@/db/schema";
import { getUserId } from "@/lib/auth";

// GET — current user's quiz scores, newest first (max 50).
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await db
      .select()
      .from(quizScores)
      .where(eq(quizScores.user_id, userId))
      .orderBy(desc(quizScores.created_at))
      .limit(50);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("quiz-scores GET error:", error);
    return NextResponse.json({ error: "Failed to load scores" }, { status: 500 });
  }
}

// POST — insert a score { score, total, session_id } for the current user.
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { score, total, session_id } = await request.json();
  if (typeof score !== "number" || typeof total !== "number") {
    return NextResponse.json(
      { error: "score and total are required" },
      { status: 400 }
    );
  }
  try {
    const today = new Date().toISOString().split("T")[0];
    const [row] = await db
      .insert(quizScores)
      .values({
        user_id: userId,
        date: today,
        score,
        total,
        session_id: session_id ?? null,
      })
      .returning();
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("quiz-scores POST error:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
