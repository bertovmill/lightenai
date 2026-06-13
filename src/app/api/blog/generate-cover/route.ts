import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { db } from "@/db";
import { generatedVisuals } from "@/db/schema";
import { uploadBlob } from "@/lib/blob";
import type { FalImageResult } from "@/lib/fal";

// Generation can take 20-40s — give the function room.
export const maxDuration = 120;

/**
 * POST /api/blog/generate-cover
 * Generate a 16:9 cover image for a blog article with FLUX.1 [dev],
 * persist it to Vercel Blob, and return the public URL.
 * Body: { title: string, prompt?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }
    fal.config({ credentials: falKey });

    const { title, prompt } = await request.json();
    if (!title && !prompt) {
      return NextResponse.json({ error: "title or prompt is required" }, { status: 400 });
    }

    // Build a brand-aligned prompt from the article title unless the caller
    // supplies their own. Editorial, calm, muted — matches the site aesthetic.
    const imagePrompt =
      prompt?.trim() ||
      `Editorial blog cover illustration for an article titled "${title}". ` +
        `Modern, minimal, sophisticated. Soft natural light, calm muted palette with ` +
        `sage green (#6B8F71) and warm off-white (#FAFAF8) tones. Abstract, conceptual, ` +
        `no text, no words, no letters. Clean negative space, premium tech-brand feel.`;

    const result = (await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: imagePrompt,
        image_size: "landscape_16_9",
        num_images: 1,
      },
      logs: false,
    })) as { data: FalImageResult };

    const falUrl = result.data?.images?.[0]?.url;
    if (!falUrl) {
      return NextResponse.json({ error: "No image returned from generator" }, { status: 502 });
    }

    // Pull the image off fal's CDN and store it on our own Blob so the cover
    // survives after fal's temporary URL expires.
    const imageRes = await fetch(falUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch generated image" }, { status: 502 });
    }
    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    const safeName = String(title || "blog-cover")
      .slice(0, 50)
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `${Date.now()}-${safeName}.${ext}`;

    let blobUrl: string;
    try {
      const blob = await uploadBlob("blog-covers", fileName, imageBuffer, contentType);
      blobUrl = blob.url;
    } catch (uploadError) {
      console.error("Cover upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload cover" }, { status: 500 });
    }

    // Record it alongside other generated visuals for reuse/browsing.
    try {
      await db.insert(generatedVisuals).values({
        url: blobUrl,
        name: title || "Blog cover",
        preset: "blog_cover",
        storage_path: fileName,
      });
    } catch (insertError) {
      // Non-fatal — the cover is already uploaded and usable.
      console.error("Cover metadata insert error:", insertError);
    }

    return NextResponse.json({ url: blobUrl });
  } catch (err) {
    console.error("Generate cover error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
