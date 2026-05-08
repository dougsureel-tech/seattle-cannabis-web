// POST /api/rewards/request-code
//
// Track B Week 1 of /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md.
// Customer enters phone on /rewards → we generate a 6-digit code,
// INSERT into loyalty_otp_codes (migration 0204), send via Twilio.
//
// Body: { phone: string }   (any format; server normalizes to E.164)
// Response shapes:
//   200 { ok: true }                   — code sent
//   200 { ok: true, demoCode: "..." }  — SMS not configured (dev/preview)
//   400 { error: "..." }               — bad phone shape
//   429 { error: "..." }               — IP rate-limit hit (5/hour)
//   500 { error: "..." }               — DB or Twilio failure
//
// Privacy posture:
//   - We DO NOT confirm whether the phone is in our customers table.
//     A request always succeeds (timing + response shape) so an
//     attacker can't enumerate customer phones via this endpoint.
//   - The verify endpoint will silently no-op if no customer matches
//     after the OTP succeeds.
//
// Rate limit: 5 successful inserts per IP per hour. Counted from the
// loyalty_otp_codes.request_ip column with a SELECT-COUNT inside the
// last 60 minutes.

import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { normalizeToE164, isSmsConfigured, sendSms } from "@/lib/sms";
import { createHash, randomBytes } from "node:crypto";
import { STORE } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PER_IP_PER_HOUR = 5;
const TTL_MINUTES = 10;

function clientIp(req: NextRequest): string {
  // Vercel-style headers (x-forwarded-for is a comma-separated list with
  // the original client IP first). Fall back to a sentinel so the
  // rate-limit query never sees a NULL ip.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function generateCode(): string {
  // 6-digit zero-padded numeric. Cryptographically random.
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function makeRowId(): string {
  return `otp_${randomBytes(12).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Bound BEFORE normalizeToE164() — that helper runs a regex strip over
  // the input string, so a 10MB phone payload would burn CPU before the
  // length check below would reject. 32 chars covers any formatted
  // international phone (E.164 max formatted ~17). Sister to
  // verify-code (this turn) + inv v190.645.
  if (typeof body.phone === "string" && body.phone.length > 32) {
    return NextResponse.json(
      { error: "Phone number doesn't look right." },
      { status: 400 },
    );
  }
  const phoneE164 = normalizeToE164(body.phone ?? "");
  if (!phoneE164.startsWith("+") || phoneE164.length < 12) {
    return NextResponse.json(
      { error: "Phone number doesn't look right." },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  const sql = getClient();

  // Per-IP rate limit. 5 OTP-generations per hour is generous enough
  // for a customer who fat-fingered their phone, tight enough to slow
  // a SMS-spam attempt.
  const rateRows = (await sql`
    SELECT COUNT(*)::int AS recent
    FROM loyalty_otp_codes
    WHERE request_ip = ${ip}
      AND created_at > NOW() - INTERVAL '1 hour'
  `) as unknown as Array<{ recent: number }>;
  const recent = rateRows[0]?.recent ?? 0;
  if (recent >= MAX_PER_IP_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many code requests. Please try again in an hour." },
      { status: 429 },
    );
  }

  const code = generateCode();
  const codeHash = hashCode(code);

  // expires_at computed app-side so the constant lives next to TTL_MINUTES.
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();

  await sql`
    INSERT INTO loyalty_otp_codes
      (id, phone, code_hash, expires_at, attempts, request_ip)
    VALUES
      (${makeRowId()},
       ${phoneE164},
       ${codeHash},
       ${expiresAt},
       0,
       ${ip})
  `;

  // SMS send. If Twilio is unconfigured (preview/dev), return the
  // code in the response so the dev can complete the flow without
  // an external SMS — still useful for end-to-end testing of the
  // verify path. Production builds always have Twilio configured;
  // this leak path is preview-only — and explicitly gated on
  // VERCEL_ENV !== "production" as belt-and-suspenders so if env
  // vars ever drift on prod (e.g. partial restore, accidental
  // unset) the OTP code can't leak in the API response. In that
  // case prod returns a generic 500 instead.
  if (!isSmsConfigured()) {
    const isProd = process.env.VERCEL_ENV === "production";
    if (isProd) {
      console.error("[request-code] SMS unconfigured on PRODUCTION — refusing to leak OTP in response");
      return NextResponse.json(
        { error: "Could not send code. Please try again or contact us." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, demoCode: code });
  }

  const messageBody = `Your ${STORE.name} rewards code: ${code}\nExpires in ${TTL_MINUTES} minutes. Reply STOP to opt out.`;
  const smsResult = await sendSms(phoneE164, messageBody);
  if (!smsResult.success) {
    // SMS failed — keep the code in the DB so the customer can retry
    // or use a fallback channel; surface a generic error to the client.
    console.error("[request-code] sendSms failed", smsResult.error);
    return NextResponse.json(
      { error: "Could not send code. Please try again or contact us." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
