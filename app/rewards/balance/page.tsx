// /rewards/balance?phone=<digits> — read-only points balance lookup.
//
// DEPRECATED — V0 query-string lookup. Replaced by /rewards/dashboard
// (OTP-gated). Kept here only as a fallback during the cutover testing
// window. /rewards/page.tsx no longer routes to this; LookupForm is
// orphaned but kept compiling. Slated for deletion once the OTP flow
// is verified end-to-end against real customer data.
//
// V0 of the SpringBig-cutover Track B PWA per
// /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md.
//
// PII MINIMIZATION (privacy posture for the cutover-testing fallback):
//   - Show: first name + last initial + points balance + tier label
//   - Hide: full last name, email, address, DOB, ID, phone (don't echo),
//     visit count, lifetime spend (those live on /rewards/dashboard
//     behind the OTP gate)
//   - "Not your account?" CTA → /rewards (clear + retry)
//
// SUCCESSOR FLOW (live as of v4.755+):
//   - Phone-OTP locally via `/api/rewards/request-code` +
//     `/api/rewards/verify-code` (Twilio-delivered 6-digit code,
//     10-min TTL, single-use, hashed at rest in the `loyalty_otp_codes`
//     table on Seattle Neon).
//   - Session cookie: `scc_rewards_session` (HMAC signed, 30-day TTL,
//     HttpOnly + Secure + SameSite=lax) — read helper at
//     `lib/rewards-session.ts` (`readRewardsSession` + `REWARDS_COOKIE_NAME`).
//   - Customer flow: /rewards → /rewards/login → /rewards/verify →
//     /rewards/dashboard (+ /history + /redeem).
// This page survives only as a smoke-test fallback during the cutover
// testing window and is slated for deletion once the OTP flow is
// verified end-to-end against real customer data.

import Link from "next/link";
import { getClient } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ phone?: string }> };

function normalizeToE164(input: string): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("+")) {
    const digitsOnly = trimmed.replace(/\D/g, "");
    return digitsOnly.length === 0 ? trimmed : `+${digitsOnly}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 11) return `+${digits}`;
  return trimmed;
}

type CustomerRow = {
  first_name: string;
  last_name: string;
  loyalty_points: number;
  last_visit_at: Date | null;
};

export default async function RewardsBalancePage({ searchParams }: Props) {
  const { phone: rawPhone } = await searchParams;
  if (!rawPhone) {
    return <NotFoundCard reason="Missing phone number." />;
  }

  const phoneE164 = normalizeToE164(rawPhone);
  if (!phoneE164.startsWith("+") || phoneE164.length < 12) {
    return <NotFoundCard reason="That phone number doesn't look right." />;
  }

  const sql = getClient();
  const rows = (await sql`
    SELECT first_name, last_name, loyalty_points, last_visit_at
    FROM customers
    WHERE phone = ${phoneE164}
      AND active = true
    ORDER BY last_visit_at DESC NULLS LAST
    LIMIT 1
  `) as unknown as CustomerRow[];

  if (rows.length === 0) {
    return <NotFoundCard reason="We couldn't find a rewards account with that number." />;
  }

  const c = rows[0];
  const firstName = (c.first_name ?? "").trim() || "Friend";
  const lastInitial = (c.last_name ?? "").trim().charAt(0).toUpperCase();
  const points = c.loyalty_points ?? 0;

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        {/* Greeting card */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold tracking-wide uppercase text-indigo-700">
            Welcome back
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            {firstName}
            {lastInitial ? ` ${lastInitial}.` : ""}
          </h1>
        </div>

        {/* Big-number points hero */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-7 sm:p-8 text-center shadow-lg shadow-indigo-900/30">
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-200 mb-1.5">
            Points balance
          </p>
          <div className="text-6xl sm:text-7xl font-extrabold tabular-nums">
            {points.toLocaleString()}
          </div>
          <p className="mt-2 text-sm text-indigo-100/90">
            See your tier on the full dashboard.
          </p>
        </div>

        {/* Pre-fix this V0 page rendered a Bronze/Silver/Gold tier
            keyed on POINTS — diverged from the canonical Visitor /
            Regular / Local / Family table (keyed on lifetime spend)
            that POS receipts + lifecycle emails use. Rather than
            duplicate the canonical computation here AND violate the
            page-header PII-minimization rule (lifetime spend gated to
            /rewards/dashboard behind OTP), the tier display is
            removed. Route customers to the OTP-authed dashboard for
            their authoritative tier. This page is a deprecated V0
            fallback anyway, slated for deletion once OTP is verified
            end-to-end. */}

        {/* What you can do here today (V0 honest-disclosure) */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-700 space-y-2">
          <p className="font-semibold text-stone-800">What this page does today</p>
          <ul className="space-y-1.5 text-stone-600 text-[13px] leading-relaxed">
            <li>✓ Shows your current points balance</li>
            <li>
              ✓ For your tier + progress, sign in at{" "}
              <Link href="/rewards" className="text-indigo-700 underline underline-offset-2">
                /rewards
              </Link>
            </li>
            <li className="text-stone-400">
              · Redemption catalog + visit history coming soon
            </li>
            <li className="text-stone-400">
              · Redeem at the counter on your next visit — your budtender
              applies the discount
            </li>
          </ul>
        </div>

        {/* Footer actions */}
        <div className="space-y-3 text-center">
          <Link
            href="/menu"
            className="block w-full rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3.5 transition-all hover:-translate-y-0.5 shadow-md shadow-indigo-900/20"
          >
            Browse the menu →
          </Link>
          <Link
            href="/rewards"
            className="block text-sm text-stone-400 hover:text-stone-600 font-medium"
          >
            Not your account? Try another number
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotFoundCard({ reason }: { reason: string }) {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-7 sm:p-8 text-center space-y-4">
          <div className="text-3xl" aria-hidden="true">🔍</div>
          <h1 className="text-2xl font-extrabold text-stone-900">No match</h1>
          <p className="text-stone-500 text-sm">{reason}</p>
          <p className="text-stone-500 text-sm">
            If you&apos;ve shopped with us before, your points are safe — we
            might just have your number stored differently. Ask your
            budtender on your next visit.
          </p>
          <Link
            href="/rewards"
            className="block w-full rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3.5 transition-all"
          >
            Try another number
          </Link>
        </div>
      </div>
    </div>
  );
}
