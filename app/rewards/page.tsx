// /rewards — phone-lookup landing for Seattle Cannabis Co loyalty.
//
// V0 scaffold for the SpringBig cutover (Track B per
// /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md). Lets a customer
// punch in their phone to see their points balance + tier without
// needing a Clerk account first.
//
// Privacy posture (no OTP yet — that ships Track B Week 1 with a new
// loyalty_otp_codes table in the Inventory App schema):
//   - Result page shows ONLY first name + last initial + points +
//     lifetime-spent. No email, no address, no DOB, no ID, no full
//     last name.
//   - Rate limit: TODO Track B Week 1 (per-IP, 5 lookups/hr).
//   - "Claim this account" CTA → /sign-up routes to Clerk + binds the
//     customer-row to the new portal_user via email match (existing
//     /account flow).
//
// This page is intentionally simple — the auth hardening + redemption
// catalog + history land in subsequent commits as Doug confirms branding
// and the OTP migration ships.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readRewardsSession, REWARDS_COOKIE_NAME } from "@/lib/rewards-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Rewards — your points balance",
  description:
    "Seattle Cannabis Co rewards. Sign in with your phone to see your points balance, tier, and lifetime stats.",
  robots: { index: false },
};

export default async function RewardsLandingPage() {
  // If they already have a session, jump straight to the dashboard.
  const cookieStore = await cookies();
  const session = readRewardsSession(cookieStore.get(REWARDS_COOKIE_NAME)?.value);
  if (session) redirect("/rewards/dashboard");

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold tracking-wide uppercase">
            Loyalty
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Your points, on your phone.
          </h1>
          <p className="text-stone-500 text-sm sm:text-base">
            Sign in with the number you give us at the register. Same
            balance, no app to install.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 rounded-3xl bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-7 sm:p-8 shadow-lg shadow-indigo-900/30 text-center space-y-4">
          <p className="text-sm text-indigo-100">
            We&apos;ll text you a 6-digit code so it&apos;s really you.
          </p>
          <Link
            href="/rewards/login"
            className="block w-full rounded-2xl bg-white hover:bg-stone-50 text-indigo-800 font-bold py-3.5 text-base transition-all hover:-translate-y-0.5"
          >
            Sign in with phone →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Heads up:</strong> we&apos;re moving
          loyalty over from our old system. If your balance looks off,
          give us a few days — every point is preserved and will show up
          here.
        </div>

        <div className="mt-8 space-y-3 text-sm text-center">
          <Link
            href="/account/sign-in"
            className="block w-full rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 hover:shadow-sm px-5 py-3.5 font-semibold text-stone-700 transition-all"
          >
            Have an account with email?{" "}
            <span className="text-indigo-700">Sign in here →</span>
          </Link>
          <p className="text-xs text-stone-400 px-4">
            Order history, ready-for-pickup alerts, and one-tap re-orders
            live in your full account.
          </p>
        </div>
      </div>
    </div>
  );
}
