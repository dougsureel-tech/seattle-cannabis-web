// POST /api/rewards/sign-out
//
// Clears the scc_rewards_session cookie. The cookie is path-scoped to
// /rewards so this only kills rewards-side auth — Clerk-side /account
// auth is untouched (they're separate identity systems by design).

import { NextResponse } from "next/server";
import { REWARDS_COOKIE_NAME } from "@/lib/rewards-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.redirect(
    new URL("/rewards/login", process.env.NEXT_PUBLIC_SITE_URL ?? "https://seattlecannabis.co"),
  );
  res.cookies.set(REWARDS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/rewards",
    maxAge: 0,
  });
  return res;
}
