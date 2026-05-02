import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { ATTR_COOKIE, ATTR_TTL_DAYS, validateAttrValue } from "@/lib/attribution";

// Routes where Clerk's middleware runs (so its UI components can hydrate
// session state) — includes the auth pages themselves so <SignIn /> renders.
const isClerkRoute = createRouteMatcher(["/account(.*)", "/sign-in(.*)", "/sign-up(.*)"]);

// Routes that REQUIRE an authenticated session. /sign-in and /sign-up are
// deliberately NOT in this list — they're the pages an unauthed user is
// SENT TO. Including them caused a self-redirect loop: visit /sign-in →
// auth.protect() sends to /sign-in?redirect_url=/sign-in → loop.
const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

// Canonical production host — every visitor should land here. Anyone hitting
// a per-deployment URL (like seattle-cannabis-abc123-dougsureel-3370s-
// projects.vercel.app) gets blocked by Vercel's deployment protection and
// sees the iOS-Safari "This page couldn't load" screen because the auth
// challenge can't complete cross-origin. We catch those at the edge and
// 308 redirect to the canonical alias so a stale link or shared deploy URL
// always resolves to a working page.
//
// Override at deploy time with NEXT_PUBLIC_CANONICAL_HOST if a custom
// domain ever lands (e.g. "www.seattlecannabis.com").
const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || "seattle-cannabis-web.vercel.app";

function isCanonicalOrLocal(host: string): boolean {
  if (!host) return true;
  const h = host.toLowerCase().split(":")[0];
  if (h === CANONICAL_HOST.toLowerCase()) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "127.0.0.1" || h === "[::1]") return true;
  if (h === "www.seattlecannabis.co" || h === "seattlecannabis.co") return true;
  return false;
}

// We *only* invoke Clerk's middleware on auth-relevant routes. Reason:
// `clerkMiddleware()` runs Clerk's server session check on every request it
// wraps, which writes the `__clerk_db_jwt` cookie + sets the
// `x-clerk-auth-reason: ...` header on the response. On public pages like
// /menu, that cookie travels along with the iHeartJane Jane Boost embed's
// credentialed cross-origin XHR (api.iheartjane.com), and iHeartJane's
// CORS check rejects requests carrying unrecognized cookies. Scoping Clerk
// to /account + /sign-in + /sign-up keeps Clerk where it belongs (auth
// flows) and removes the cookie/header noise from every other route.
const clerk = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;
  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect_url", req.url);
  await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
});

export default async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // /menu must be served from www, not apex. iHeartJane's CORS allowlist
  // for embedConfigId 222 (Seattle) was registered against the WP origin
  // www.seattlecannabis.co when the partnership was set up — the bare
  // apex (seattlecannabis.co) is NOT on the allowlist, so Boost's
  // cross-origin XHR to api.iheartjane.com gets CORS-rejected when the
  // page is served from apex. Confirmed via WP DB dump of
  // wp_jane_store_menu_config: WP /menu/ ran under www. Match that exact
  // origin. Scoped to /menu* only so /account etc. keep their existing
  // Clerk session-cookie scope on apex.
  if (url.hostname === "seattlecannabis.co" && url.pathname.startsWith("/menu")) {
    const target = new URL(req.url);
    target.hostname = "www.seattlecannabis.co";
    return NextResponse.redirect(target.toString(), 308);
  }

  if (!isCanonicalOrLocal(url.hostname)) {
    const target = new URL(req.url);
    target.hostname = CANONICAL_HOST;
    target.protocol = "https:";
    target.port = "";
    return NextResponse.redirect(target.toString(), 308);
  }
  if (isClerkRoute(req)) {
    return (clerk as unknown as (req: NextRequest) => Promise<Response> | Response)(req);
  }

  // Marketing attribution capture — last-touch wins. Mirrors greenlife-web
  // proxy. See lib/attribution.ts for the source-kind allowlist.
  const fromParam = url.searchParams.get("from");
  if (fromParam) {
    const validated = validateAttrValue(fromParam);
    if (validated) {
      const res = NextResponse.next();
      res.cookies.set(ATTR_COOKIE, validated, {
        maxAge: 60 * 60 * 24 * ATTR_TTL_DAYS,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        secure: url.protocol === "https:",
      });
      return res;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
