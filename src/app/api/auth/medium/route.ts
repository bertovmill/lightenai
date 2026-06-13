import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { socialConnections } from "@/db/schema";
import { getMediumProfile } from "@/lib/social/oauth";

/**
 * POST /api/auth/medium
 * Connects Medium using an integration token from env vars.
 */
export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrationToken = process.env.MEDIUM_INTEGRATION_TOKEN;

  if (!integrationToken) {
    return NextResponse.json({ error: "Medium integration token not configured" }, { status: 500 });
  }

  try {
    const profile = await getMediumProfile(integrationToken);
    console.log("Medium profile fetched:", profile.username, profile.id);

    const values: typeof socialConnections.$inferInsert = {
      user_id: user.id,
      platform: "medium" as typeof socialConnections.$inferInsert["platform"],
      platform_user_id: profile.id,
      profile_name: profile.name || profile.username,
      profile_image: profile.imageUrl || null,
      access_token: integrationToken,
      token_expires_at: null, // Integration tokens don't expire
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
    console.error("Medium connection error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
