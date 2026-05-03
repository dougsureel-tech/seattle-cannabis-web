import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { getClient } from "@/lib/db";
import { sendQuizMatchEmail } from "@/lib/quiz-nurture-email";
import { STORE } from "@/lib/store";

// Hack #6 — Strain-finder quiz email capture.
//
// POST /api/quiz/capture
// Body: { email, vibe?, strain_type?, category? }
//
// Validates the email shape, dedupes by (LOWER(email), source) within
// the last 7 days, generates a 256-bit unsubscribe token, INSERTs a
// `quiz_captures` row, and fires the D+0 "Your strain match is in"
// email via `after()` so the response is never blocked by Resend
// latency. D+5 + D+12 are dispatched separately by the inventoryapp-
// side `/api/cron/quiz-nurture` cron.
//
// **Gating:** the entire endpoint is no-op'd unless
// `QUIZ_NURTURE_ENABLED=true` is set on the Vercel project. Default
// OFF — Doug flips it after he verifies the Resend domain + checks
// the first few D+0 sends in the logs. The corresponding client-side
// gate is `NEXT_PUBLIC_QUIZ_NURTURE_ENABLED`; the capture card in
// `StrainFinderClient.tsx` doesn't render without it, so this endpoint
// being callable when the public env var is also set is intentional.
//
// **Security checks:**
//   • Email validated by regex + max length + reject newlines/CR
//     (header injection prevention).
//   • Other fields max length 64 chars + null on miss (no SQL
//     interpolation — Drizzle/neon parameterizes the values).
//   • Dedupe lookup is exact-match on `(LOWER(email), source)` within
//     a 7-day window so a button-mash doesn't double-send.
//   • Token = `crypto.randomBytes(32).toString('hex')` — 256 bits,
//     unguessable, URL-safe by construction (hex only).
//   • Errors are logged WITHOUT the recipient address.

const SOURCE = "seattle";
const MAX_EMAIL_LEN = 254;
const EMAIL_RE = /^[^\s@<>"'`\\;]+@[^\s@<>"'`\\;]+\.[^\s@<>"'`\\;]+$/;
const MAX_FIELD_LEN = 64;

export async function POST(req: NextRequest) {
  if (process.env.QUIZ_NURTURE_ENABLED !== "true") {
    return NextResponse.json({ ok: true, skipped: "feature_disabled" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const rawEmail = typeof b.email === "string" ? b.email.trim() : "";
  if (!rawEmail) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  if (rawEmail.length > MAX_EMAIL_LEN) {
    return NextResponse.json({ error: "Email too long" }, { status: 400 });
  }
  if (/[\r\n]/.test(rawEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!EMAIL_RE.test(rawEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const sanitize = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim().slice(0, MAX_FIELD_LEN);
    return t.length > 0 ? t : null;
  };
  const vibe = sanitize(b.vibe);
  const strainType = sanitize(b.strain_type);
  const category = sanitize(b.category);

  const sql = getClient();
  const lowerEmail = rawEmail.toLowerCase();

  try {
    const dupRows = await sql`
      SELECT id FROM quiz_captures
      WHERE LOWER(email) = ${lowerEmail}
        AND source = ${SOURCE}
        AND captured_at > NOW() - INTERVAL '7 days'
      LIMIT 1
    `;
    if (dupRows.length > 0) {
      return NextResponse.json({ ok: true, dedupe: true });
    }

    const unsubscribedToken = crypto.randomBytes(32).toString("hex");
    const id = crypto.randomUUID();

    await sql`
      INSERT INTO quiz_captures (
        id, email, vibe, strain_type, category, source, unsubscribed_token
      ) VALUES (
        ${id}, ${rawEmail}, ${vibe}, ${strainType}, ${category}, ${SOURCE}, ${unsubscribedToken}
      )
    `;

    const params = new URLSearchParams();
    if (vibe) params.set("vibe", vibe);
    if (category) params.set("category", category);
    if (strainType) params.set("strain", strainType);
    const deepLinkOrder = params.toString()
      ? `${STORE.website}/order?${params}`
      : `${STORE.website}/order`;

    // Seattle's STORE.googleMapsUrl exists — verified in lib/store.ts.
    after(async () => {
      try {
        await sendQuizMatchEmail({
          to: rawEmail,
          firstName: null,
          vibe,
          strainType,
          unsubscribeToken: unsubscribedToken,
          storeName: STORE.name,
          deepLinkOrder,
          mapUrl: STORE.googleMapsUrl,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[quiz/capture] D+0 dispatch failed: ${msg}`);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[quiz/capture] insert failed: ${msg}`);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
