import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { Resend } from "resend";

const getResend = () => process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const VALID_STATUSES = ["lead", "targeted", "contacted"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filters = [];
    if (from) filters.push(gte(inquiries.created_at, from));
    if (to) filters.push(lte(inquiries.created_at, to));

    const data = await db
      .select()
      .from(inquiries)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(inquiries.created_at));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
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

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      first_name,
      last_name,
      company,
      role,
      website,
      company_size,
      annual_revenue,
      project_budget,
      services,
      message,
    } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const data = await db
      .insert(inquiries)
      .values({
        email,
        first_name,
        last_name,
        company,
        role,
        website,
        company_size,
        annual_revenue,
        project_budget,
        services,
        message,
      })
      .returning();

    // Send email notification (non-blocking — don't let email failure break the form)
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    const resend = getResend();
    const isPrototypeRequest = services === "AI Rapid Prototype";

    if (notificationEmail && resend) {
      const emailPayload = isPrototypeRequest
        ? {
            from: "Lighten AI <onboarding@resend.dev>",
            to: notificationEmail,
            subject: `🚨 PROTOTYPE REQUEST: ${escapeHtml(email)}`,
            headers: {
              "X-Priority": "1",
              "Importance": "high",
            },
            html: `
              <div style="font-family:sans-serif;max-width:600px;">
                <div style="background:#5F9468;color:white;padding:16px 20px;border-radius:8px 8px 0 0;">
                  <h2 style="margin:0;font-size:18px;">🚨 New Rapid Prototype Request</h2>
                </div>
                <div style="border:1px solid #e5e5e5;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
                  <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">From</p>
                  <p style="margin:0 0 16px;font-size:16px;"><a href="mailto:${encodeURI(email)}" style="color:#1C1C1C;">${escapeHtml(email)}</a></p>

                  <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">What they want to build</p>
                  <div style="background:#F5F4F1;border:1px solid #E8E6E1;border-radius:8px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#1C1C1C;">${escapeHtml(message)}</p>
                  </div>

                  ${website ? `
                  <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">LinkedIn</p>
                  <p style="margin:0 0 16px;font-size:15px;"><a href="${encodeURI(website)}" style="color:#5F9468;">${escapeHtml(website)}</a></p>
                  ` : ""}

                  <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">Service</p>
                  <p style="margin:0;font-size:15px;color:#1C1C1C;">${escapeHtml(services)}</p>
                </div>
              </div>
            `,
          }
        : {
            from: "Lighten AI <onboarding@resend.dev>",
            to: notificationEmail,
            subject: `New Inquiry: ${escapeHtml(first_name)} ${escapeHtml(last_name)} at ${escapeHtml(company)}`,
            html: `
              <h2>New inquiry from lightenai.com</h2>
              <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(first_name)} ${escapeHtml(last_name)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${encodeURI(email)}">${escapeHtml(email)}</a></td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Company</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(company)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Role</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(role)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Website</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(website)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Company Size</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(company_size)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Annual Revenue</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(annual_revenue) || "—"}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Project Budget</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(project_budget)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Services</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(services)}</td></tr>
                ${message ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;">Additional Info</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(message)}</td></tr>` : ""}
              </table>
            `,
          };

      resend.emails
        .send(emailPayload)
        .then((result) => console.log("Resend result:", JSON.stringify(result)))
        .catch((err) => console.error("Resend error:", err));
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
