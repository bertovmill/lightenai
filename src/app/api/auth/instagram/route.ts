import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { socialConnections } from "@/db/schema";

const GRAPH_API_VERSION = "v21.0";

/**
 * POST /api/auth/instagram
 * Connects Instagram using the Page Access Token and Instagram Business Account ID
 * from environment variables (Instagram Graph API via Facebook Login).
 */
export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageAccessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const igBusinessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!pageAccessToken) {
    return NextResponse.json({ error: "Instagram Page Access Token not configured" }, { status: 500 });
  }
  if (!igBusinessId) {
    return NextResponse.json({ error: "Instagram Business Account ID not configured" }, { status: 500 });
  }

  try {
    // Fetch Instagram business profile using the Graph API
    const profileRes = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${igBusinessId}?fields=id,username,name,profile_picture_url&access_token=${pageAccessToken}`
    );

    if (!profileRes.ok) {
      const err = await profileRes.text();
      console.error("Instagram profile fetch error:", err);
      return NextResponse.json({ error: "Failed to fetch Instagram profile" }, { status: 500 });
    }

    const profile = await profileRes.json();
    console.log("Instagram profile fetched:", profile.username, profile.id);

    // Upsert connection — store the page access token (which can publish)
    const values: typeof socialConnections.$inferInsert = {
      user_id: user.id,
      platform: "instagram" as typeof socialConnections.$inferInsert["platform"],
      platform_user_id: igBusinessId,
      profile_name: profile.name || profile.username,
      profile_image: profile.profile_picture_url || null,
      access_token: pageAccessToken,
      token_expires_at: new Date(Date.now() + 5184000 * 1000).toISOString(), // ~60 days
      updated_at: new Date().toISOString(),
    };
    await db.insert(socialConnections).values(values).onConflictDoUpdate({
      target: [socialConnections.user_id, socialConnections.platform],
      set: values,
    });

    return NextResponse.json({
      success: true,
      profile: { username: profile.username, name: profile.name },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    console.error("Instagram connection error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
