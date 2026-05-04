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

// Single canonical customer-facing host. EVERY non-canonical incoming host
// (apex `seattlecannabis.co`, per-deployment Vercel URLs like
// `seattle-cannabis-abc123-dougsureel-3370s-projects.vercel.app`, the bare
// `seattle-cannabis-web.vercel.app` deployment alias) 308-redirects here.
//
// Reasons this is the single source of authority:
//   1. iHeartJane Boost's CORS allowlist for embedConfigId 222 (Seattle)
//      was registered against this exact origin when the partnership was
//      stood up — apex requests to api.iheartjane.com get CORS-rejected.
//      See memory `reference_iheartjane_cors_origin` + MENU_LOG.md.
//   2. Clerk session cookies are single-host. Splitting customers across
//      apex + www would silently break "I just signed in but /account
//      still says signed-out" loops if a customer wandered between hosts.
//   3. Per-deployment URLs (anything ending in `-dougsureel-3370s-projects
//      .vercel.app`) get blocked by Vercel's deployment-protection auth
//      challenge and render the iOS-Safari "This page couldn't load"
//      overlay. Catching them at the edge means stale share-links always
//      resolve to a working page.
//
// Override at deploy time with NEXT_PUBLIC_CANONICAL_HOST if a brand-new
// custom domain ever lands (e.g. moving to .com in the future).
const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || "www.seattlecannabis.co";

// Belt-and-suspenders: even if NEXT_PUBLIC_CANONICAL_HOST is ever
// misconfigured at deploy time (e.g. a stale value from when the deployment
// alias was canonical), the production customer-facing host MUST always be
// treated as canonical so we never accidentally redirect customers AWAY
// from www.seattlecannabis.co.
const ALWAYS_CANONICAL_HOSTS = new Set(["www.seattlecannabis.co"]);

function isCanonicalOrLocal(host: string): boolean {
  if (!host) return true;
  const h = host.toLowerCase().split(":")[0];
  if (h === CANONICAL_HOST.toLowerCase()) return true;
  if (ALWAYS_CANONICAL_HOSTS.has(h)) return true;
  // Local dev hosts pass through untouched — never redirect to the prod
  // canonical or the dev iframe stops responding.
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "127.0.0.1" || h === "[::1]") return true;
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

  // /brands index → /menu (308 permanent). The brands index was deleted
  // 2026-05-04 (Doug + Kat call) but the page-level `permanentRedirect()`
  // approach in `app/brands/page.tsx` didn't produce a true HTTP 308 even
  // with `dynamic = "force-dynamic"` (Next 16 quirk — response body came
  // back as homepage HTML at HTTP 200). Middleware-level intercept runs
  // BEFORE rendering and emits a real 308. Per-brand pages /brands/[slug]
  // are kept (graduated boutique pages) — only the bare /brands index
  // redirects.
  if (url.pathname === "/brands" || url.pathname === "/brands/") {
    const target = new URL("/menu", req.url);
    return NextResponse.redirect(target.toString(), 308);
  }

  // Site-wide canonical-host redirect. Was previously scoped to `/menu*`
  // only (because that path was the original CORS-driven case — see
  // CANONICAL_HOST comment above), but every other route benefits too:
  // saves one hop for first-time apex visitors, keeps Clerk session
  // cookies on a single host, and rescues stale per-deployment share-
  // links. Local dev hostnames are exempt via isCanonicalOrLocal().
  //
  // /api/health* is exempt: external monitors and the post-deploy LKG
  // verification curl (per OPERATING_PRINCIPLES) need to hit any host
  // alias and get a clean 200 with `sha` + `version` — a 308 response
  // body has no JSON to parse, and following the redirect would mask
  // host-specific liveness signal. Covers both /api/health (full DB +
  // content check) and /api/health/ping (cheap second-bucket liveness)
  // since both serve the same monitoring use cases.
  if (!isCanonicalOrLocal(url.hostname) && !url.pathname.startsWith("/api/health")) {
    const target = new URL(req.url);
    target.hostname = CANONICAL_HOST;
    target.protocol = "https:";
    target.port = "";
    return NextResponse.redirect(target.toString(), 308);
  }
  // TEMPORARY 2026-05-04 per Doug — Seattle inventoryapp DB has Wenatchee-
  // seeded prices on shared-ID products (OUTSTANDING_WORK 3.9 + INCIDENTS),
  // so the in-tree /order menu shows wrong prices. /menu (iHeartJane Boost
  // embed at storeId 5295) shows the real Dutchie Seattle prices. Page-level
  // `redirect()` from next/navigation in app/order/page.tsx didn't fire
  // (rendered the layout shell + loading state with HTTP 200 instead) — this
  // middleware-level NextResponse.redirect always returns 307 cleanly.
  // Restore: delete this 6-line block when /order tree prices are reconciled.
  if (url.pathname === "/order" || url.pathname.startsWith("/order/")) {
    return NextResponse.redirect(new URL("/menu", req.url), 307);
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
