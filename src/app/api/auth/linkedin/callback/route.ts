import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { socialConnections } from "@/db/schema";
import { exchangeLinkedInCode, getLinkedInProfile } from "@/lib/social/oauth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/admin?social_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/admin?social_error=missing_params`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("linkedin_oauth_state")?.value;

  // Clean up cookie
  cookieStore.delete("linkedin_oauth_state");

  if (!savedState || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/admin?social_error=state_mismatch`);
  }

  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    // Exchange code for tokens
    const tokens = await exchangeLinkedInCode(code);
    const profile = await getLinkedInProfile(tokens.access_token);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Upsert connection
    const values = {
      user_id: user.id,
      platform: "linkedin" as const,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: expiresAt,
      platform_user_id: profile.id,
      profile_name: profile.name,
      profile_image: profile.profileImage || null,
      updated_at: new Date().toISOString(),
    };
    await db.insert(socialConnections).values(values).onConflictDoUpdate({
      target: [socialConnections.user_id, socialConnections.platform],
      set: values,
    });

    return NextResponse.redirect(`${appUrl}/admin?social_connected=linkedin`);
  } catch (err) {
    console.error("LinkedIn OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/admin?social_error=token_exchange_failed`);
  }
}
