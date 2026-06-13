import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { socialLeads } from "@/db/schema";

const VALID_PLATFORMS = ["linkedin", "x", "medium", "youtube", "instagram", "tiktok"];

export async function POST(request: NextRequest) {
  try {
    const { platform, contact_name, profile_url, message_summary } =
      await request.json();

    if (!contact_name || typeof contact_name !== "string" || !contact_name.trim()) {
      return NextResponse.json({ error: "contact_name is required" }, { status: 400 });
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `platform must be one of: ${VALID_PLATFORMS.join(", ")}` },
        { status: 400 }
      );
    }

    const data = await db
      .insert(socialLeads)
      .values({
        platform,
        contact_name: contact_name.trim(),
        profile_url: profile_url || null,
        message_summary: message_summary || null,
      })
      .returning();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filters = [];
    if (platform && VALID_PLATFORMS.includes(platform)) {
      filters.push(eq(socialLeads.platform, platform as never));
    }
    if (from) filters.push(gte(socialLeads.lead_date, from));
    if (to) filters.push(lte(socialLeads.lead_date, to));

    const data = await db
      .select()
      .from(socialLeads)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(socialLeads.lead_date), desc(socialLeads.created_at));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const VALID_STATUSES = ["lead", "targeted", "contacted"];

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const data = await db
      .update(socialLeads)
      .set({ status })
      .where(eq(socialLeads.id, id))
      .returning();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.delete(socialLeads).where(eq(socialLeads.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
