import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedVisuals } from "@/db/schema";
import { uploadBlob } from "@/lib/blob";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, name, preset } = await request.json();

    if (!imageUrl || !name) {
      return NextResponse.json({ error: "imageUrl and name are required" }, { status: 400 });
    }

    // Fetch the image from fal.ai CDN
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image from CDN" }, { status: 502 });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    const fileName = `${Date.now()}-${name.slice(0, 50).replace(/[^a-zA-Z0-9-_]/g, "_")}.${ext}`;

    // Upload to Vercel Blob
    let blobUrl: string;
    try {
      const blob = await uploadBlob("visuals", fileName, imageBuffer, contentType);
      blobUrl = blob.url;
    } catch (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
    }

    // Insert metadata row
    let row;
    try {
      [row] = await db
        .insert(generatedVisuals)
        .values({
          url: blobUrl,
          name,
          preset: preset || "hero",
          storage_path: fileName,
        })
        .returning();
    } catch (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 });
    }

    return NextResponse.json({ data: row });
  } catch (err) {
    console.error("Visuals save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
