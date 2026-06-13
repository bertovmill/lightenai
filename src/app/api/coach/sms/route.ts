import { after } from "next/server";
import { runCoachTurn } from "@/lib/coach/agent";
import { sendSms } from "@/lib/coach/twilio";

export const runtime = "nodejs";
export const maxDuration = 300; // the coach turn (read memory + reason) can take a minute+

/**
 * Twilio inbound-SMS webhook. Twilio POSTs form-encoded { From, Body, ... }.
 * We ack Twilio immediately (empty TwiML) and run the coach in the background
 * via after(), replying with one or more outbound SMS. This avoids Twilio's
 * ~15s webhook timeout, since the agent can take much longer than that.
 */
const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
const xml = () =>
  new Response(EMPTY_TWIML, { status: 200, headers: { "Content-Type": "text/xml" } });

export async function POST(request: Request) {
  let from = "";
  let body = "";
  try {
    const form = await request.formData();
    from = String(form.get("From") ?? "");
    body = String(form.get("Body") ?? "").trim();
  } catch {
    return xml();
  }

  const allowed = process.env.COACH_PHONE_NUMBER;
  // Only the owner's verified number can talk to the coach (ignore everyone else).
  if (!allowed || from !== allowed || !body) {
    return xml();
  }

  // Do the slow work after responding so Twilio doesn't time out.
  after(async () => {
    try {
      const messages = await runCoachTurn(from, body);
      for (const msg of messages) {
        await sendSms(from, msg);
      }
    } catch (err) {
      console.error("coach sms turn failed:", err);
      try {
        await sendSms(from, "Sorry, I hit a snag on my end. Try me again in a moment.");
      } catch {
        /* give up quietly */
      }
    }
  });

  return xml();
}
