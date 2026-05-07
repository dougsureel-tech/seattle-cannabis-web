// /rewards/balance?phone=<digits> — read-only points balance lookup.
//
// V0 of the SpringBig-cutover Track B PWA per
// /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md. Customer enters
// phone on /rewards, lands here with the phone in the query string;
// we look up the customers row and render a privacy-conservative card.
//
// PII MINIMIZATION (privacy posture without OTP):
//   - Show: first name + last initial + points balance + tier label
//     + lifetime spent
//   - Hide: full last name, email, address, DOB, ID, phone (don't echo)
//   - "Not your account?" CTA → /rewards (clear + retry)
//
// TODO Track B Week 1:
//   - Replace this query-string flow with phone-OTP via Twilio. The
//     customer enters phone → we send a 6-digit code → they enter the
//     code → THEN they see the balance. This V0 is sufficient for the
//     SCC migration smoke-test but will be tightened before launch.
//   - Per-IP rate limiting (5 lookups/hr).
//   - Store loyalty_otp_codes table — needs migration in Inventory App.

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

function tierLabel(points: number): { label: string; nextAt: number | null } {
  // Mirrors the inventoryapp loyalty-tier engine for display purposes
  // only. Actual redemption math runs at POS via lib/loyalty-redemption.
  // Bronze 0-249 / Silver 250-749 / Gold 750+ — kept simple for the
  // customer-facing card. Real cliff is 300/400 redemption tiers.
  if (points >= 750) return { label: "Gold", nextAt: null };
  if (points >= 250) return { label: "Silver", nextAt: 750 };
  return { label: "Bronze", nextAt: 250 };
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
  const tier = tierLabel(points);
  const progressPct = tier.nextAt
    ? Math.min(100, Math.round((points / tier.nextAt) * 100))
    : 100;

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
            <span className="font-semibold">{tier.label}</span> tier
          </p>
        </div>

        {/* Tier progress */}
        {tier.nextAt && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-stone-700 mb-2">
              <span>{tier.label} → next tier</span>
              <span className="text-stone-400 tabular-nums">
                {tier.nextAt - points} pts to go
              </span>
            </div>
            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* What you can do here today (V0 honest-disclosure) */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-700 space-y-2">
          <p className="font-semibold text-stone-800">What this page does today</p>
          <ul className="space-y-1.5 text-stone-600 text-[13px] leading-relaxed">
            <li>✓ Shows your current points balance</li>
            <li>✓ Shows your tier + progress to the next one</li>
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
          <div className="text-3xl">🔍</div>
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
