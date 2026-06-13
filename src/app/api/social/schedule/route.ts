import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, gte, ne } from "drizzle-orm";
import { db } from "@/db";
import { scheduledPosts } from "@/db/schema";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return non-cancelled posts from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const data = await db
    .select()
    .from(scheduledPosts)
    .where(
      and(
        ne(scheduledPosts.status, "cancelled"),
        gte(scheduledPosts.created_at, sevenDaysAgo),
      ),
    )
    .orderBy(asc(scheduledPosts.scheduled_at));

  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform, text, imageUrl, markdownContent, asOrganization, scheduledAt } = await request.json();

  const validPlatforms = ["x", "linkedin", "linkedin_org", "instagram", "medium", "facebook"];
  if (!platform || !validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (!scheduledAt) {
    return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledAt date" }, { status: 400 });
  }

  if (scheduledDate <= new Date()) {
    return NextResponse.json({ error: "scheduledAt must be in the future" }, { status: 400 });
  }

  const dbPlatform = (platform === "linkedin" && asOrganization) ? "linkedin_org" : platform;

  const [data] = await db
    .insert(scheduledPosts)
    .values({
      user_id: userId,
      platform: dbPlatform,
      text: text.trim(),
      image_url: imageUrl || null,
      markdown_content: markdownContent || null,
      as_organization: !!asOrganization,
      scheduled_at: scheduledDate.toISOString(),
      status: "pending",
    })
    .returning();

  return NextResponse.json({ success: true, post: data });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id query param is required" }, { status: 400 });
  }

  await db
    .update(scheduledPosts)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(scheduledPosts.id, id),
        eq(scheduledPosts.user_id, userId),
        eq(scheduledPosts.status, "pending"),
      ),
    );

  return NextResponse.json({ success: true });
}
