import { NextRequest, NextResponse } from "next/server";
import { runCoachTurn } from "@/lib/coach/agent";
import { sendSms } from "@/lib/coach/twilio";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Daily proactive check-in. Vercel Cron hits this on a schedule (see vercel.json).
 * Sends a "daily check-in" trigger into the rolling coach session and texts the
 * result to the owner. The agent reads memory (goals + last check-in) and crafts
 * a personalized nudge.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phone = process.env.COACH_PHONE_NUMBER;
  if (!phone) {
    return NextResponse.json({ error: "COACH_PHONE_NUMBER not set" }, { status: 500 });
  }

  try {
    const messages = await runCoachTurn(
      phone,
      "[DAILY CHECK-IN] It's the start of a new day. Review my goals and last check-in, then send me a short, personal check-in text."
    );
    for (const msg of messages) {
      await sendSms(phone, msg);
    }
    return NextResponse.json({ ok: true, sent: messages.length });
  } catch (err) {
    console.error("coach check-in failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
