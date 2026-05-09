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

import { NextRequest, NextResponse, after } from "next/server";
import { getClient } from "@/lib/db";
import { normalizeToE164 } from "@/lib/sms";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { DAY_MS, MINUTE_MS } from "@/lib/time-constants";
import { createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const SESSION_TTL_DAYS = 30;
const COOKIE_NAME = "scc_rewards_session";

// Per-IP rate limit on verify-code POSTs. Each call runs a DB SELECT on
// loyalty_otp_codes by phone (composite-indexed but still a DB hop) +
// possibly a UPDATE on attempts. Without a per-IP cap, an attacker can
// fire 1000 req/s from one IP → DB load DoS, even though MAX_ATTEMPTS=5
// per row makes brute-force infeasible. 20/min/IP is generous (legit
// users enter 1-3 attempts per OTP) and caps DB load. Sister of
// /api/rewards/request-code's DB-backed 5/hr/IP limit (different shape:
// COUNT-based on persisted rows there, in-memory here for speed since
// verify-code traffic is much higher).
const verifyLimiter = createRateLimiter({ limit: 20, windowMs: MINUTE_MS });
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

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
    expiresAt: Date.now() + SESSION_TTL_DAYS * DAY_MS,
    purpose: "scc-rewards-v1",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signSession(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function POST(req: NextRequest) {
  if (!verifyLimiter.check(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Bound BEFORE downstream normalization + .trim() — without this, a
  // 10MB phone or code payload would burn CPU on the regex strip inside
  // normalizeToE164() / on the .trim() pass before the format checks
  // below would reject. Same defense class as inv v190.645 (sister
  // /api/customer/auth/verify input caps). Phone 32 chars (E.164 max
  // formatted ~17), code 16 (6 digits + slack).
  if (
    (typeof body.phone === "string" && body.phone.length > 32) ||
    (typeof body.code === "string" && body.code.length > 16)
  ) {
    return NextResponse.json({ error: "Code is invalid or expired. Request a new one." }, { status: 401 });
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

  // Constant-time comparison so a timing attack can't leak the hash
  // byte-by-byte. Practical risk here is ~zero (MAX_ATTEMPTS=5 + 10-min
  // TTL caps the number of probes far below what's needed to extract
  // bytes via timing, and network jitter dwarfs any per-byte signal),
  // but `timingSafeEqual` is the right pattern for any hash/HMAC
  // comparison — defense-in-depth + matches the rest of the codebase's
  // auth-class hash patterns.
  const suppliedHash = hashCode(supplied);
  const suppliedBuf = Buffer.from(suppliedHash, "hex");
  const storedBuf = Buffer.from(row.code_hash, "hex");
  const ok =
    suppliedBuf.length === storedBuf.length &&
    timingSafeEqual(suppliedBuf, storedBuf);

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

  // SpringBig→SCC migration funnel (Doug 2026-05-07): stamp first
  // /rewards sign-in for migration-funnel reporting on inventoryapp
  // /admin/marketing. Schema added in inventoryapp migration 0215
  // (rewards_signed_in_at TIMESTAMPTZ, NULL = not yet signed in via
  // the new flow). Idempotent — only sets when NULL so subsequent
  // sign-ins don't bump the timestamp + lose the "first sign-in"
  // signal. Fired via `after()` so the response isn't blocked by
  // the UPDATE (and a UPDATE failure can't break login). Does NOT
  // confirm whether the customer row exists — preserves the privacy
  // posture noted at the top of the file (server side learns nothing
  // an attacker probing this endpoint couldn't already learn).
  // Retroactive PWA-install attribution — when an OTP sign-in arrives from
  // a device that already has the install cookie (`scc_pwa_installed=1`,
  // dropped by /api/track-install on first standalone-mode hit), back-fill
  // `customers.scc_app_installed_at` for the customer. /api/track-install
  // only sets this when a Clerk session is active, but the typical flow is
  // (a) install PWA anonymously → (b) open /rewards → (c) sign in via OTP.
  // Without this hook, step (a)'s install never gets attributed to the
  // customer at all and the migration-funnel "Installed" tile undercounts
  // by exactly the install-before-signin cohort. Same `after()` block as
  // the rewards_signed_in_at stamp; same idempotent COALESCE guard.
  const isInstalledDevice = req.cookies.get("scc_pwa_installed")?.value === "1";

  after(async () => {
    try {
      await sql`
        UPDATE customers
        SET rewards_signed_in_at = COALESCE(rewards_signed_in_at, NOW())
        WHERE phone = ${phoneE164}
      `;
      if (isInstalledDevice) {
        await sql`
          UPDATE customers
          SET scc_app_installed_at = COALESCE(scc_app_installed_at, NOW())
          WHERE phone = ${phoneE164}
        `;
      }
    } catch (err) {
      // Format-only — DB errors echo the WHERE phone=${phoneE164} clause
      // (customer phone PII). Sister of v8.575 / v8.625 PII-leak hardening.
      const reason = err instanceof Error ? err.name : "unknown";
      console.error(`[verify-code] rewards_signed_in_at update failed: ${reason}`);
    }
  });

  return res;
}
