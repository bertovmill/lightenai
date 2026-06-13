import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { socialConnections } from "@/db/schema";
import { exchangeLinkedInOrgCode } from "@/lib/social/oauth";

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
  const savedState = cookieStore.get("linkedin_org_oauth_state")?.value;

  cookieStore.delete("linkedin_org_oauth_state");

  if (!savedState || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/admin?social_error=state_mismatch`);
  }

  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    const tokens = await exchangeLinkedInOrgCode(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Store as a separate "linkedin_org" connection
    const values: typeof socialConnections.$inferInsert = {
      user_id: user.id,
      platform: "linkedin_org" as typeof socialConnections.$inferInsert["platform"],
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: expiresAt,
      platform_user_id: "org",
      profile_name: "Company Page",
      profile_image: null,
      org_id: "110242005",
      org_name: "Lighten AI",
      updated_at: new Date().toISOString(),
    };
    await db.insert(socialConnections).values(values).onConflictDoUpdate({
      target: [socialConnections.user_id, socialConnections.platform],
      set: values,
    });

    return NextResponse.redirect(`${appUrl}/admin?social_connected=linkedin_org`);
  } catch (err) {
    console.error("LinkedIn Org OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/admin?social_error=token_exchange_failed`);
  }
}
