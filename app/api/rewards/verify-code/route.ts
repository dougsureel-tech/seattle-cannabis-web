// POST /api/rewards/verify-code
//
// Track B Week 1 of /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md.
// Customer enters phone + 6-digit code at /rewards/verify → server
// looks up unconsumed-and-unexpired loyalty_otp_codes row, hashes
// supplied code with SHA-256, compares against code_hash, consumes
// on match, issues an HMAC-signed cookie scoped to /rewards.
//
// Body: { phone: string, code: string }
// Response shapes:
//   200 { ok: true }                    — code matched, cookie set
//   400 { error: "..." }                — bad shape
//   401 { error: "..." }                — code invalid / expired / exhausted
//   500 { error: "..." }                — DB or sign failure
//
// Privacy posture:
//   - We DO NOT confirm whether the phone has a customers row. The
//     cookie is issued purely on OTP match; the dashboard endpoints
//     downstream do the customers-table join.
//   - "Code invalid" / "code expired" / "too many attempts" all
//     return the same 401 response shape so an attacker can't tell
//     which case applies. We DO log the discriminator on the server
//     side for debugging.
//
// Attempt counter:
//   - Each verify increments `attempts` on the most-recent row.
//   - At 5 attempts the row is silently treated as exhausted.

import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { normalizeToE164 } from "@/lib/sms";
import { createHash, createHmac } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const SESSION_TTL_DAYS = 30;
const COOKIE_NAME = "scc_rewards_session";

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function signSession(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** base64url-encoded JSON payload + "." + HMAC-SHA-256 signature. */
function makeSessionCookie(phoneE164: string, secret: string): string {
  const payload = {
    phone: phoneE164,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_DAYS * 86_400_000,
    purpose: "scc-rewards-v1",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signSession(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function POST(req: NextRequest) {
  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phoneE164 = normalizeToE164(body.phone ?? "");
  const supplied = (body.code ?? "").trim();

  if (!phoneE164.startsWith("+") || phoneE164.length < 12) {
    return NextResponse.json(
      { error: "Phone number doesn't look right." },
      { status: 400 },
    );
  }
  if (!/^\d{6}$/.test(supplied)) {
    return NextResponse.json(
      { error: "Code should be 6 digits." },
      { status: 400 },
    );
  }

  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret) {
    console.error("[verify-code] DASHBOARD_SESSION_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const sql = getClient();

  // Pull the most recent unconsumed-unexpired row for this phone. Hot
  // path uses the (phone, consumed_at, expires_at) composite index.
  const rows = (await sql`
    SELECT id, code_hash, attempts
    FROM loyalty_otp_codes
    WHERE phone = ${phoneE164}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `) as unknown as Array<{ id: string; code_hash: string; attempts: number }>;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Code is invalid or expired. Request a new one." },
      { status: 401 },
    );
  }

  const row = rows[0];

  if (row.attempts >= MAX_ATTEMPTS) {
    // Mark consumed so this row can't be retried; force the customer
    // to request a fresh code.
    await sql`
      UPDATE loyalty_otp_codes
      SET consumed_at = NOW()
      WHERE id = ${row.id}
    `;
    return NextResponse.json(
      { error: "Too many attempts. Request a new code." },
      { status: 401 },
    );
  }

  const suppliedHash = hashCode(supplied);
  const ok = suppliedHash === row.code_hash;

  if (!ok) {
    await sql`
      UPDATE loyalty_otp_codes
      SET attempts = attempts + 1
      WHERE id = ${row.id}
    `;
    return NextResponse.json(
      { error: "Code is invalid or expired. Request a new one." },
      { status: 401 },
    );
  }

  // Consume the row so the same code can't be replayed.
  await sql`
    UPDATE loyalty_otp_codes
    SET consumed_at = NOW()
    WHERE id = ${row.id}
  `;

  const cookieValue = makeSessionCookie(phoneE164, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/rewards",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
  return res;
}
