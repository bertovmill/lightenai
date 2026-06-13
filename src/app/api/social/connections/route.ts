import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { socialConnections } from "@/db/schema";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select({
      platform: socialConnections.platform,
      platform_user_id: socialConnections.platform_user_id,
      profile_name: socialConnections.profile_name,
      profile_image: socialConnections.profile_image,
      token_expires_at: socialConnections.token_expires_at,
      org_id: socialConnections.org_id,
      org_name: socialConnections.org_name,
    })
    .from(socialConnections)
    .where(eq(socialConnections.user_id, userId));

  const connections = (data || []).map((c) => ({
    platform: c.platform,
    platformUserId: c.platform_user_id,
    profileName: c.profile_name,
    profileImage: c.profile_image,
    isExpired: c.token_expires_at ? new Date(c.token_expires_at) < new Date() : false,
    orgId: c.org_id,
    orgName: c.org_name,
  }));

  return NextResponse.json({ connections });
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform, orgId, orgName } = await request.json();

  if (!platform || !["x", "linkedin", "instagram", "medium", "facebook"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  await db
    .update(socialConnections)
    .set({ org_id: orgId || null, org_name: orgName || null, updated_at: new Date().toISOString() })
    .where(
      and(
        eq(socialConnections.user_id, userId),
        eq(socialConnections.platform, platform),
      ),
    );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (!platform || !["x", "linkedin", "linkedin_org", "instagram", "medium", "facebook"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .delete(socialConnections)
    .where(
      and(
        eq(socialConnections.user_id, userId),
        eq(
          socialConnections.platform,
          platform as "x" | "linkedin" | "linkedin_org" | "instagram" | "medium" | "facebook",
        ),
      ),
    );

  return NextResponse.json({ success: true });
}
