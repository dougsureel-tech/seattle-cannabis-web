// /rewards/dashboard — authed customer home for the SpringBig
// cutover Track B PWA per /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md.
//
// Auth model: scc_rewards_session cookie set by /api/rewards/verify-code.
// readRewardsSession() verifies HMAC + decodes payload + checks expiry.
// On any failure, redirect to /rewards/login.
//
// Privacy: shows first name + last initial + points + tier + lifetime
// stats. Does NOT show: full last name, email, address, DOB, ID. Same
// posture as the V0 /rewards/balance page; the OTP-gated path simply
// confirms it's actually the customer behind the phone.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readRewardsSession, REWARDS_COOKIE_NAME } from "@/lib/rewards-session";
import { getClient } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your rewards",
  robots: { index: false },
};

function tierLabel(points: number): { label: string; nextAt: number | null } {
  if (points >= 750) return { label: "Gold", nextAt: null };
  if (points >= 250) return { label: "Silver", nextAt: 750 };
  return { label: "Bronze", nextAt: 250 };
}

type CustomerRow = {
  first_name: string;
  last_name: string;
  loyalty_points: number;
  last_visit_at: Date | null;
  created_at: Date | null;
  visit_count: number;
  lifetime_spend: number;
};

export default async function RewardsDashboardPage() {
  const cookieStore = await cookies();
  const session = readRewardsSession(cookieStore.get(REWARDS_COOKIE_NAME)?.value);
  if (!session) redirect("/rewards/login");

  const sql = getClient();
  const rows = (await sql`
    SELECT
      c.first_name,
      c.last_name,
      c.loyalty_points::int AS loyalty_points,
      c.last_visit_at,
      c.created_at,
      (
        SELECT COUNT(*)::int
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS visit_count,
      (
        SELECT COALESCE(SUM(t.total::numeric), 0)::float
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS lifetime_spend
    FROM customers c
    WHERE c.phone = ${session.phone}
      AND c.active = true
    ORDER BY c.last_visit_at DESC NULLS LAST
    LIMIT 1
  `) as unknown as CustomerRow[];

  if (rows.length === 0) {
    // Authed via OTP but no customer record. Could be:
    //   (a) brand-new SpringBig customer not yet migrated
    //   (b) phone normalized differently in our DB (unlikely after migration)
    //   (c) account deactivated
    return <NotFoundCard phone={session.phone} />;
  }

  const c = rows[0];
  const firstName = (c.first_name ?? "").trim() || "Friend";
  const lastInitial = (c.last_name ?? "").trim().charAt(0).toUpperCase();
  const points = c.loyalty_points ?? 0;
  const tier = tierLabel(points);
  const progressPct = tier.nextAt
    ? Math.min(100, Math.round((points / tier.nextAt) * 100))
    : 100;
  const visitCount = c.visit_count ?? 0;
  const lifetimeSpend = c.lifetime_spend ?? 0;
  const memberSinceMs = c.created_at instanceof Date ? c.created_at.getTime() : null;
  const memberSinceLabel = memberSinceMs
    ? new Date(memberSinceMs).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold tracking-wide uppercase text-indigo-700">
            Welcome back
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            {firstName}
            {lastInitial ? ` ${lastInitial}.` : ""}
          </h1>
          {memberSinceLabel && (
            <p className="text-xs text-stone-400">Member since {memberSinceLabel}</p>
          )}
        </div>

        {/* Big points hero */}
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

        {/* Lifetime stats strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-xs font-bold tracking-wide uppercase text-stone-500 mb-1">
              Visits
            </p>
            <p className="text-2xl font-extrabold text-stone-900 tabular-nums">
              {visitCount}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-xs font-bold tracking-wide uppercase text-stone-500 mb-1">
              Lifetime
            </p>
            <p className="text-2xl font-extrabold text-stone-900 tabular-nums">
              ${Math.round(lifetimeSpend).toLocaleString()}
            </p>
          </div>
        </div>

        {/* What's coming soon */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-700 space-y-2">
          <p className="font-semibold text-stone-800">Coming soon</p>
          <ul className="space-y-1.5 text-stone-600 text-[13px] leading-relaxed">
            <li className="text-stone-400">· Redeem points right here for accessories + store credit</li>
            <li className="text-stone-400">· Visit history with what you bought + what you earned</li>
            <li className="text-stone-400">· Add to your home screen for one-tap access</li>
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
          <form action="/api/rewards/sign-out" method="POST">
            <button
              type="submit"
              className="text-sm text-stone-400 hover:text-stone-600 font-medium"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function NotFoundCard({ phone }: { phone: string }) {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-7 sm:p-8 text-center space-y-4">
          <div className="text-3xl">🌱</div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            We don&apos;t have you on file yet
          </h1>
          <p className="text-stone-500 text-sm">
            Your phone ({phone.slice(-4)}) isn&apos;t in our customer system
            yet. If you&apos;ve shopped with us, give your number to your
            budtender on your next visit and you&apos;ll show up here.
          </p>
          <Link
            href="/menu"
            className="block w-full rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3.5 transition-all"
          >
            Browse the menu →
          </Link>
          <form action="/api/rewards/sign-out" method="POST">
            <button
              type="submit"
              className="text-sm text-stone-400 hover:text-stone-600 font-medium"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
