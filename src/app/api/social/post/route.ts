import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { socialConnections, SOCIAL_CONNECTION_PLATFORMS } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";
import { postToX, postToLinkedIn, postToInstagram, postToMedium, postToFacebook, refreshXToken, refreshInstagramToken } from "@/lib/social/oauth";

import sharp from "sharp";

type ConnectionPlatform = (typeof SOCIAL_CONNECTION_PLATFORMS)[number];

/**
 * Re-upload an image to Vercel Blob as JPEG so Instagram can access it.
 * Instagram Graph API only supports JPEG. fal.ai CDN URLs are also blocked.
 */
async function getPublicImageUrl(imageUrl: string): Promise<string> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to download image for re-upload");

  const buffer = Buffer.from(await imgRes.arrayBuffer());

  // Convert to JPEG (Instagram API only supports JPEG)
  const jpegBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();

  const fileName = `social/${Date.now()}.jpg`;
  const { url } = await uploadBlob("visuals", fileName, jpegBuffer, "image/jpeg");
  return url;
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform, text, asOrganization, imageUrl, markdownContent } = await request.json();

  if (!platform || !["x", "linkedin", "instagram", "medium", "facebook"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  // For org posting, use the separate linkedin_org connection
  const dbPlatform: ConnectionPlatform =
    platform === "linkedin" && asOrganization ? "linkedin_org" : platform;

  // Fetch stored connection
  const [connection] = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.user_id, user.id),
        eq(socialConnections.platform, dbPlatform)
      )
    )
    .limit(1);

  if (!connection) {
    if (asOrganization) {
      return NextResponse.json({ error: "Company page not connected. Click 'Connect Company Page' first." }, { status: 404 });
    }
    return NextResponse.json({ error: "Platform not connected" }, { status: 404 });
  }

  let accessToken = connection.access_token;

  // Check if token is expired and try to refresh
  if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
    if (platform === "x" && connection.refresh_token) {
      try {
        const refreshed = await refreshXToken(connection.refresh_token);
        accessToken = refreshed.access_token;

        await db
          .update(socialConnections)
          .set({
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token,
            token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .where(
            and(
              eq(socialConnections.user_id, user.id),
              eq(socialConnections.platform, "x")
            )
          );
      } catch {
        return NextResponse.json(
          { error: "TOKEN_EXPIRED", message: "Please reconnect your X account" },
          { status: 401 }
        );
      }
    } else if (platform === "instagram") {
      try {
        const refreshed = await refreshInstagramToken(accessToken);
        accessToken = refreshed.access_token;

        await db
          .update(socialConnections)
          .set({
            access_token: refreshed.access_token,
            token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .where(
            and(
              eq(socialConnections.user_id, user.id),
              eq(socialConnections.platform, "instagram")
            )
          );
      } catch {
        return NextResponse.json(
          { error: "TOKEN_EXPIRED", message: "Please reconnect your Instagram account" },
          { status: 401 }
        );
      }
    } else {
      const platformName = platform === "x" ? "X" : platform === "instagram" ? "Instagram" : "LinkedIn";
      return NextResponse.json(
        { error: "TOKEN_EXPIRED", message: `Please reconnect your ${platformName} account` },
        { status: 401 }
      );
    }
  }

  try {
    if (platform === "medium") {
      // Use markdown content for Medium articles
      const mdContent = markdownContent || text;
      // Extract title from first heading or use first line
      const titleMatch = mdContent.match(/^#\s+(.+)$/m) || mdContent.match(/^(.+)$/m);
      const title = titleMatch ? titleMatch[1].replace(/[#*_`]/g, "").trim() : "Untitled";
      const authorId = connection.platform_user_id;
      const result = await postToMedium(accessToken, authorId, title, mdContent);
      return NextResponse.json({ success: true, postId: result.id, url: result.url, draft: true });
    } else if (platform === "facebook") {
      const pageId = connection.platform_user_id;
      const plainText = text.trim();
      let fbImageUrl = imageUrl;
      if (fbImageUrl) {
        // Re-upload to Supabase for a public URL (same as Instagram)
        fbImageUrl = await getPublicImageUrl(fbImageUrl);
      }
      const result = await postToFacebook(accessToken, pageId, plainText, fbImageUrl);
      return NextResponse.json({ success: true, postId: result.id });
    } else if (platform === "instagram") {
      if (!imageUrl) {
        return NextResponse.json({ error: "Instagram requires an image. Add an image to your document first." }, { status: 400 });
      }
      // Instagram can't fetch from fal.ai CDN — re-upload to Supabase for a public URL
      const publicUrl = await getPublicImageUrl(imageUrl);
      console.log("Instagram: using public image URL:", publicUrl);
      const igUserId = connection.platform_user_id;
      const result = await postToInstagram(accessToken, igUserId, text.trim(), publicUrl);
      return NextResponse.json({ success: true, postId: result.id });
    } else if (platform === "x") {
      const result = await postToX(accessToken, text.trim(), imageUrl);
      return NextResponse.json({ success: true, postId: result.data?.id });
    } else if (asOrganization) {
      // Org posting uses the linkedin_org connection's token + org_id
      const orgId = connection.org_id;
      if (!orgId) {
        return NextResponse.json({ error: "No org ID configured" }, { status: 400 });
      }
      const result = await postToLinkedIn(accessToken, orgId, "organization", text.trim(), imageUrl);
      return NextResponse.json({ success: true, postId: result.id });
    } else {
      // Personal posting
      const authorId = connection.platform_user_id;
      if (!authorId || authorId === "unknown") {
        return NextResponse.json(
          { error: "LinkedIn personal posting unavailable. Please disconnect and reconnect LinkedIn." },
          { status: 400 }
        );
      }
      const result = await postToLinkedIn(accessToken, authorId, "person", text.trim(), imageUrl);
      return NextResponse.json({ success: true, postId: result.id });
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    console.error(`Social post error (${platform}):`, errMessage);
    if (errMessage === "TOKEN_EXPIRED") {
      return NextResponse.json(
        { error: "TOKEN_EXPIRED", message: `Please reconnect your ${platform === "x" ? "X" : "LinkedIn"} account` },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: errMessage, details: errMessage }, { status: 500 });
  }
}
