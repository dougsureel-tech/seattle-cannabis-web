// /rewards — landing page for Seattle Cannabis Co loyalty PWA.
//
// Replaces SpringBig as the customer-facing loyalty surface (Track B per
// /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md). When a returning
// customer hits this URL with a valid `gl_customer` session cookie they
// jump straight to /rewards/dashboard. Cold visitors land here, click
// the CTA, and start the phone-OTP flow at /rewards/login.
//
// Auth: phone-OTP via the inventoryapp `/api/customer/auth/send-code` +
// `/api/customer/auth/verify` endpoints (loyalty_otp_codes table, mig
// 0204 in inventoryapp). 6-digit code, 10-min TTL, 5-attempts cap, single-
// use, hashed-at-rest. Session cookie name `gl_customer` (purpose-namespaced
// HMAC, 30-day TTL, HttpOnly + Secure + SameSite=lax).
//
// Surfaces post-auth:
//   - /rewards/dashboard — points, tier, redemption catalog
//   - /rewards/history — visit + earnings history
//   - /rewards/redeem — pick a tier → mint a redemption-intent token →
//     QR for the budtender to scan at /pos/checkout
//   - /rewards (this page) — landing for cold visitors only
//
// Add-to-Home-Screen banner on first visit (AddToHomeScreen.tsx mounted
// on dashboard) walks them through pinning the PWA so it feels like an app.

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
