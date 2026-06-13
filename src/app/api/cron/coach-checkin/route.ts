import { NextRequest, NextResponse } from "next/server";
import { runCoachTurn } from "@/lib/coach/agent";
import { sendSms } from "@/lib/coach/twilio";

export const runtime = "nodejs";
export const maxDuration = 300;

const DAILY_TRIGGER =
  "[DAILY CHECK-IN] It's the start of a new day. Review my goals and last check-in, then send me a short, personal check-in text.";

const WEEKLY_TRIGGER =
  "[WEEKLY REFLECTION] It's the end of the week. Review my goals and this week's check-in log, then send me a short weekly reflection: what moved, what stalled, and the single most important focus for next week. Keep it warm but honest.";

/**
 * Proactive coach trigger. Vercel Cron hits this daily (see vercel.json).
 * On Sundays it runs the WEEKLY REFLECTION; every other day, the DAILY CHECK-IN.
 * (Folded into one cron to stay within the free-plan cron limit.)
 *
 * Manual override for testing: ?kind=weekly or ?kind=daily.
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

  const kind = new URL(request.url).searchParams.get("kind");
  const isWeekly = kind === "weekly" || (kind !== "daily" && new Date().getUTCDay() === 0); // 0 = Sunday
  const trigger = isWeekly ? WEEKLY_TRIGGER : DAILY_TRIGGER;

  try {
    const messages = await runCoachTurn(phone, trigger);
    for (const msg of messages) {
      await sendSms(phone, msg);
    }
    return NextResponse.json({ ok: true, kind: isWeekly ? "weekly" : "daily", sent: messages.length });
  } catch (err) {
    console.error("coach check-in failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
