import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { socialConnections } from "@/db/schema";
import { getFacebookPageInfo } from "@/lib/social/oauth";

/**
 * POST /api/auth/facebook
 * Connects Facebook Page using the same Page Access Token as Instagram
 * and FACEBOOK_PAGE_ID from env vars.
 */
export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageAccessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!pageAccessToken) {
    return NextResponse.json({ error: "Facebook Page Access Token not configured" }, { status: 500 });
  }
  if (!pageId) {
    return NextResponse.json({ error: "Facebook Page ID not configured" }, { status: 500 });
  }

  try {
    const pageInfo = await getFacebookPageInfo(pageAccessToken, pageId);
    console.log("Facebook page fetched:", pageInfo.name, pageInfo.id);

    const values: typeof socialConnections.$inferInsert = {
      user_id: user.id,
      platform: "facebook" as typeof socialConnections.$inferInsert["platform"],
      platform_user_id: pageId,
      profile_name: pageInfo.name,
      profile_image: pageInfo.picture || null,
      access_token: pageAccessToken,
      token_expires_at: new Date(Date.now() + 5184000 * 1000).toISOString(), // ~60 days (same as Instagram)
      updated_at: new Date().toISOString(),
    };
    await db.insert(socialConnections).values(values).onConflictDoUpdate({
      target: [socialConnections.user_id, socialConnections.platform],
      set: values,
    });

    return NextResponse.json({
      success: true,
      profile: { name: pageInfo.name, id: pageInfo.id },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    console.error("Facebook connection error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
