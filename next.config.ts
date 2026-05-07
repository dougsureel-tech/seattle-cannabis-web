import type { NextConfig } from "next";

// SECURITY HEADERS — TEMPORARILY REMOVED (2026-05-01 22:55 PT).
//
// MENU_LOG hypotheses #4–#6 (Referrer-Policy swap, jane:version meta tag,
// Clerk middleware scoping) didn't unblock Boost on the new Vercel deploy,
// despite identical bootstrap config to the still-working WP origin. The
// remaining cross-origin-affecting diff between WP responses and ours is
// these added security headers: WP sends NONE of them; we send four. The
// strongest suspect is `Permissions-Policy: payment=()` — Boost feature-
// detects the Payment Request API on init, and a blocking policy could
// abort hydration silently. Removing the whole block puts us byte-for-byte
// on WP's profile so we can confirm or rule out the policy class as a
// confound. Add back individually with confirmed-safe values once /menu
// is rendering products.

// Permissions-Policy verbatim from the still-working WordPress origin's
// /menu response (curl --resolve www.{domain}:443:208.109.64.51). Grants
// Private State Token redemption + issuance for Cloudflare's challenge
// endpoints — that's how iHeartJane's Cloudflare WAF verifies a real
// browser without CAPTCHA. Without this header, browsers default to
// "self only" and Cloudflare can't redeem the trust token issued during
// the page load → flags Boost's API requests as bot traffic → CORS
// rejection. This was the lone HTTP-header delta between WP (works) and
// our Vercel deploy (CORS-blocks).
const PERMISSIONS_POLICY =
  'private-state-token-redemption=(self "https://www.google.com" "https://www.gstatic.com" "https://recaptcha.net" "https://challenges.cloudflare.com" "https://hcaptcha.com"), ' +
  'private-state-token-issuance=(self "https://www.google.com" "https://www.gstatic.com" "https://recaptcha.net" "https://challenges.cloudflare.com" "https://hcaptcha.com")';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
          // X-Content-Type-Options nosniff: prevents browsers from MIME-
          // sniffing a response away from its declared Content-Type. Was
          // NOT in the 2026-05-01 removal — that pass yanked Referrer-Policy,
          // X-Frame-Options, X-XSS-Protection, and Strict-Transport-Security
          // to match the still-working WordPress origin's iHJ-compatible
          // header set. nosniff has zero interaction with iHeartJane Boost
          // (no MIME-sniffing involved), is universally safe, and closes a
          // small XSS-via-mismatched-Content-Type gap. Add other classic
          // security headers back individually after iHJ regression-testing.
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  // **/menu + /order rule (DO NOT REMOVE):** never add a redirect that
  // bounces /menu or /order to a different domain. /menu hosts the iHeartJane
  // Boost embed inline (app/menu/page.tsx + JaneMenu.tsx); off-domain redirects
  // break the embed model. If /menu renders blank, iHeartJane usually rotated
  // the Boost bundle hash — see ~/Documents/CODE/INCIDENTS.md → "Blank /menu
  // after iHeartJane rotated the Boost bundle hash" (2026-05-01) for the
  // diagnostic walk. NEVER bounce off-domain as a workaround.
  //
  // **Pre-Next.js legacy URL preservation (added 2026-05-07):** before this
  // Next.js site replaced the previous platform, common e-commerce-style URLs
  // (/shop, /products, /flower, /concentrates, /strains) accumulated SEO juice
  // + inbound links. Probing each path 2026-05-07 confirmed all 404 on the new
  // site — these 308s redirect to the closest semantic equivalent so stale
  // Google index entries + old social-media links don't dead-end. Doug 2026-05-07:
  // "we should also make sure we did that with seattle and wenatchee if needed"
  // (ref: GW pre-cutover redirect map shipped same day). Each redirect points
  // TO /menu, /find-your-strain, /order, or /about — never AWAY from the canonical
  // domain (which would break the iHeartJane embed model per the rule above).
  async redirects() {
    return [
      // Same-content-different-name swaps.
      { source: "/about-us", destination: "/about", permanent: true },

      // Legacy e-commerce paths -> /menu (the canonical product surface,
      // iHeartJane Boost embed). All 404'd on the new site pre-fix.
      { source: "/shop", destination: "/menu", permanent: true },
      { source: "/products", destination: "/menu", permanent: true },
      { source: "/flower", destination: "/menu", permanent: true },
      { source: "/concentrates", destination: "/menu", permanent: true },
      { source: "/edibles", destination: "/menu", permanent: true },
      { source: "/pre-rolls", destination: "/menu", permanent: true },
      { source: "/vapes", destination: "/menu", permanent: true },

      // Strain-finder has its own SEO-aware page on the new site — better fit
      // than /menu for the "/strains" inbound (search-intent matches).
      { source: "/strains", destination: "/find-your-strain", permanent: true },

      // Booking-style legacy URL — /order is the pickup-cart flow (already
      // 307-redirects to /menu via proxy.ts until the native cart goes live;
      // this preserves the future-correct landing).
      { source: "/book", destination: "/order", permanent: true },
      { source: "/book-now", destination: "/order", permanent: true },
    ];
  },
};

export default nextConfig;
