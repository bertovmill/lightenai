import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { generatedVisuals } from "@/db/schema";

export async function GET() {
  try {
    const data = await db
      .select({
        id: generatedVisuals.id,
        url: generatedVisuals.url,
        name: generatedVisuals.name,
        preset: generatedVisuals.preset,
        created_at: generatedVisuals.created_at,
      })
      .from(generatedVisuals)
      .orderBy(desc(generatedVisuals.created_at))
      .limit(20);

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Visuals list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
