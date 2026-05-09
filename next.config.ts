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
          // small XSS-via-mismatched-Content-Type gap.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // X-Frame-Options SAMEORIGIN restored 2026-05-08 per Doug's
          // "Add other classic security headers back individually after
          // iHJ regression-testing" directive in the original removal note.
          // Why safe: iHJ Boost loads iHJ origins INSIDE our /menu iframe
          // (we iframe THEM), not the reverse. X-Frame-Options on our
          // origin governs who can iframe US — no plausible interaction
          // with Boost's nested iframes pointing at api.iheartjane.com.
          // Verified pre-add: `curl /menu | grep iframe` returns empty
          // (Boost iframes injected dynamically + point at iHJ, not back
          // at seattlecannabis.co). Closes the standing clickjacking
          // gap on the customer surface (the apply form / account /
          // order CTAs are real action targets that benefit from
          // frame-busting). Sister of glw same-day. If /menu regresses
          // post-deploy, single-line revert: drop this header back out.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Referrer-Policy strict-origin-when-cross-origin — the lone
          // remaining 2026-05-01-removed header. Restored 2026-05-09 per
          // the same Doug directive that brought back X-Frame-Options.
          // Why safe vs iHJ Boost: Referrer-Policy controls what WE tell
          // external sites about where the user came from on outbound
          // requests — has zero interaction with iHJ's inbound trust-
          // token redemption (Permissions-Policy gated; already in place).
          // Default browser behavior without this header sends full
          // URL+query string to external image hosts / analytics — a
          // privacy leak on customer-facing /rewards?token=… surfaces
          // and any session-token-bearing query params. strict-origin-
          // when-cross-origin sends origin-only on cross-origin (path
          // + query stripped). Already in place on inv + GW + cannagent
          // + glw (sister-shipped same day). Closes the cross-site
          // drift caught by /loop saturation grind 2026-05-09 security-
          // header audit.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
      // Mirror parity from glw same-day fix — pre-fix `/about/mission` + `/about/location`
      // 404'd on Sea even though they were already 308'd on Wen. Common
      // WP-era nested-about URL patterns; keep stale Google index entries +
      // partner-directory listings landing on a real page.
      { source: "/about/mission", destination: "/about", permanent: true },
      { source: "/about/location", destination: "/visit", permanent: true },

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

      // Booking-style legacy URLs. Destination flattened from `/order` →
      // `/menu` direct (v9.225): /order itself 307s → /menu via proxy.ts
      // during the iHJ-Boost era, so chaining /book → /order → /menu was
      // a 3-hop redirect (extra Google crawl cycle + customer latency).
      // When the native /order eventually replaces iHJ, this map gets
      // updated as a wave alongside the proxy.ts /order rewrite removal.
      { source: "/book", destination: "/menu", permanent: true },
      { source: "/book-now", destination: "/menu", permanent: true },

      // Round-2 e-comm path expansion + WP-legacy info paths (Doug
      // 2026-05-07: "same with seattle" — mirror of glw v6.165). Catches
      // wildcard variants Sea was missing + the common /contact /location
      // /hours /our-story style URLs that WordPress retailer sites
      // typically had.
      { source: "/shop/:path*", destination: "/menu", permanent: true },
      { source: "/products/:path*", destination: "/menu", permanent: true },
      { source: "/prerolls", destination: "/menu", permanent: true },
      { source: "/cartridges", destination: "/menu", permanent: true },
      { source: "/topicals", destination: "/menu", permanent: true },
      { source: "/tinctures", destination: "/menu", permanent: true },
      { source: "/accessories", destination: "/menu", permanent: true },
      { source: "/strain/:slug*", destination: "/find-your-strain", permanent: true },

      // Common e-commerce-platform legacy URL patterns that 404'd pre-fix.
      // /cart + /buy are universal Shopify/WooCommerce legacy aliases;
      // /pickup matches customer-intent URLs that some loyalty/POS
      // platforms emit; /preroll is the singular sister of /prerolls
      // (already in the existing /pre-rolls map). All redirect to /menu.
      // Sister glw same wave.
      { source: "/cart", destination: "/menu", permanent: true },
      { source: "/buy", destination: "/menu", permanent: true },
      { source: "/pickup", destination: "/menu", permanent: true },
      { source: "/preroll", destination: "/menu", permanent: true },

      // Legacy loyalty bookmarks → /rewards (canonical customer portal —
      // OTP-gated on /api/rewards/request-code → /api/rewards/verify-code,
      // session-cookie issues a 30-day Rewards session). Pre-fix /loyalty
      // 404'd; legacy bookmarks from the SpringBig era hit a dead URL.
      // Caught by /loop saturation grind 2026-05-09 customer-flow smoke
      // test. Sister glw same wave (which routes /loyalty → /account
      // since glw doesn't have a /rewards portal).
      { source: "/loyalty", destination: "/rewards", permanent: true },

      // Auth-URL alias normalization. Clerk uses `/sign-in` + `/sign-up`
      // (hyphenated). The unhyphenated forms + `/login` are the most
      // common legacy variants. Pre-fix all four 404'd. Sister glw v9.205.
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/signin", destination: "/sign-in", permanent: true },
      { source: "/signup", destination: "/sign-up", permanent: true },

      // Generic legacy aliases: /sale is a common e-commerce deals page
      // alias from prior platforms. (Skip /home — scc /home returns 200
      // already since `app/home/page.tsx` exists; only glw 404'd.)
      { source: "/sale", destination: "/deals", permanent: true },

      // Round-2 legacy alias sweep (caught by /loop saturation grind
      // 2026-05-09 wide-path probe). Sister glw v9.405. Same intent:
      // map frequently-bookmarked aliases to canonical surfaces.
      // Product/menu aliases:
      { source: "/jobs", destination: "/careers", permanent: true },
      { source: "/catalog", destination: "/menu", permanent: true },
      { source: "/checkout", destination: "/menu", permanent: true },
      { source: "/search", destination: "/menu", permanent: true },
      // Form-submission redirect targets:
      { source: "/thanks", destination: "/", permanent: true },
      { source: "/thank-you", destination: "/", permanent: true },
      { source: "/thankyou", destination: "/", permanent: true },
      // Help / support / news:
      { source: "/help", destination: "/contact", permanent: true },
      { source: "/support", destination: "/contact", permanent: true },
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/story", destination: "/about", permanent: true },
      // Visit-page aliases:
      { source: "/map", destination: "/visit", permanent: true },
      { source: "/directions", destination: "/visit", permanent: true },
      { source: "/hours", destination: "/visit", permanent: true },
      // Age-gate aliases:
      { source: "/age-verify", destination: "/", permanent: true },
      { source: "/21", destination: "/", permanent: true },
      { source: "/verify", destination: "/", permanent: true },
      // Email/SMS preferences live in /rewards on scc (OTP-gated portal,
      // unlike glw which uses Clerk-managed /account):
      { source: "/preferences", destination: "/rewards", permanent: true },
      { source: "/optout", destination: "/rewards", permanent: true },
      { source: "/opt-out", destination: "/rewards", permanent: true },
      { source: "/unsubscribe", destination: "/rewards", permanent: true },

      // Round-3 legacy alias sweep (caught by /loop saturation grind
      // 2026-05-09 wide-path probe round 3). Sister glw v9.605.
      { source: "/lost-password", destination: "/sign-in", permanent: true },
      { source: "/first-time", destination: "/menu", permanent: true },
      { source: "/new-customer", destination: "/menu", permanent: true },
      { source: "/first-visit", destination: "/menu", permanent: true },
      { source: "/military", destination: "/deals", permanent: true },
      { source: "/veterans", destination: "/deals", permanent: true },
      { source: "/senior", destination: "/deals", permanent: true },
      { source: "/promo", destination: "/deals", permanent: true },
      { source: "/promos", destination: "/deals", permanent: true },
      { source: "/offers", destination: "/deals", permanent: true },
      { source: "/coupons", destination: "/deals", permanent: true },
      { source: "/coupon", destination: "/deals", permanent: true },
      { source: "/strain-finder", destination: "/find-your-strain", permanent: true },
      { source: "/quiz", destination: "/find-your-strain", permanent: true },
      { source: "/book-online", destination: "/menu", permanent: true },
      { source: "/reserve", destination: "/menu", permanent: true },
      { source: "/pre-order", destination: "/menu", permanent: true },
      { source: "/preorder", destination: "/menu", permanent: true },
      { source: "/pickup-order", destination: "/menu", permanent: true },
      { source: "/location-map", destination: "/visit", permanent: true },
      { source: "/education", destination: "/learn", permanent: true },
      { source: "/cookie-policy", destination: "/privacy", permanent: true },
      { source: "/privacy-statement", destination: "/privacy", permanent: true },

      // Round-4 legacy alias sweep. Sister glw v9.805.
      // Generic-cannabis SEO-term aliases:
      { source: "/weed", destination: "/", permanent: true },
      { source: "/marijuana", destination: "/", permanent: true },
      { source: "/cannabis", destination: "/", permanent: true },
      { source: "/dispensary", destination: "/", permanent: true },
      // PWA install flow happens via the customer rewards portal on scc:
      { source: "/app", destination: "/rewards", permanent: true },
      { source: "/download", destination: "/rewards", permanent: true },
      { source: "/install", destination: "/rewards", permanent: true },
      // Deal-page aliases:
      { source: "/happy-hour", destination: "/deals", permanent: true },
      { source: "/daily-deal", destination: "/deals", permanent: true },
      { source: "/daily-deals", destination: "/deals", permanent: true },
      { source: "/early-bird", destination: "/deals", permanent: true },
      // Loyalty-program aliases (scc uses /rewards — OTP portal):
      { source: "/points", destination: "/rewards", permanent: true },
      { source: "/rewards-program", destination: "/rewards", permanent: true },
      { source: "/member", destination: "/rewards", permanent: true },
      { source: "/membership", destination: "/rewards", permanent: true },
      // Form-submission post-redirect aliases:
      { source: "/success", destination: "/", permanent: true },
      { source: "/confirmed", destination: "/", permanent: true },
      { source: "/confirmation", destination: "/", permanent: true },
      // Legacy `.html`-extension URLs:
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/home.html", destination: "/", permanent: true },
      { source: "/menu.html", destination: "/menu", permanent: true },

      // Common WordPress / legacy info-page paths → semantic equivalent.
      // /contact has a real page on the new site (linked from sitemap.ts +
      // faq + structured-data canonical) — DO NOT redirect /contact, only
      // redirect the legacy aliases that point AT it.
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/location", destination: "/visit", permanent: true },
      { source: "/locations", destination: "/visit", permanent: true },
      { source: "/find-us", destination: "/visit", permanent: true },
      { source: "/hours", destination: "/visit", permanent: true },
      { source: "/our-story", destination: "/about", permanent: true },
      { source: "/team", destination: "/about", permanent: true },
      { source: "/staff", destination: "/about", permanent: true },

      // /privacy + /terms aren't real pages on the new site (operating
      // disclosures live on /about + the WSLCB-required posters in-store).
      // Redirect to /about so old-indexed URLs land on something rather
      // than 404.
      { source: "/privacy-policy", destination: "/about", permanent: true },
      { source: "/privacy", destination: "/about", permanent: true },
      { source: "/terms-of-service", destination: "/about", permanent: true },
      { source: "/terms-and-conditions", destination: "/about", permanent: true },
      { source: "/terms", destination: "/about", permanent: true },
      { source: "/tos", destination: "/about", permanent: true },

      // WP author/category/tag archives — never had real customer value;
      // collapse to /blog so inbound links don't dead-end.
      { source: "/author/:slug*", destination: "/blog", permanent: true },
      { source: "/blog/author/:slug*", destination: "/blog", permanent: true },
      { source: "/blog/category/:slug*", destination: "/blog", permanent: true },
      { source: "/blog/blog/:path*", destination: "/blog", permanent: true },
      { source: "/tag/:slug*", destination: "/blog", permanent: true },
      { source: "/category/:slug*", destination: "/blog", permanent: true },

      // ── SEO recovery: WordPress-era blog posts at root (Doug 2026-05-08)
      // Wayback CDX confirmed 30+ blog post URLs at root were still being
      // crawled in March 2026 (last month before the Next.js switchover).
      // Each had its own SEO weight and inbound-link history. Without
      // these redirects all 30+ would 404 and Google would de-index, losing
      // the trickle of "how to roll a blunt" / "how to make weed butter" /
      // "is marijuana legal in Seattle" long-tail traffic that drove
      // discovery for new customers. Each → /blog (the new article hub)
      // so any reader following an old Google result lands on something
      // useful rather than a dead page. /blog has its own SEO authority
      // for cannabis-education content; consolidating the link equity is
      // the right move post-WP-cutover.
      { source: "/3-healthy-ways-to-use-seattle-cannabis-vapes-bongs-and-edibles", destination: "/blog", permanent: true },
      { source: "/4-important-traits-of-a-seattle-cannabis-store", destination: "/blog", permanent: true },
      { source: "/420-in-seattle-make-this-years-420-event-the-best-yet", destination: "/blog", permanent: true },
      { source: "/5-in-demand-cannabis-strains-at-our-seattle-cannabis-store", destination: "/blog", permanent: true },
      { source: "/5-innovative-ways-a-seattle-marijuana-store-can-attract-new-customers", destination: "/blog", permanent: true },
      { source: "/5-reasons-seattle-cannabis-is-the-top-seattle-marijuana-company", destination: "/blog", permanent: true },
      { source: "/5-reasons-to-have-cannabis-in-your-life", destination: "/blog", permanent: true },
      { source: "/5-reasons-why-seattle-cannabis-company-is-the-best-seattle-marijuana-store", destination: "/blog", permanent: true },
      { source: "/7-seattle-cannabis-products-designed-for-marijuana-enthusiasts", destination: "/blog", permanent: true },
      { source: "/a-plethora-of-recreational-marijuana-products-under-one-roof", destination: "/blog", permanent: true },
      { source: "/bill-to-transform-marijuana-regulation-from-state-sen-kohl-welles", destination: "/blog", permanent: true },
      { source: "/bob-marleys-global-marijuana-brand-family-helped-by-seattle-company", destination: "/blog", permanent: true },
      { source: "/buy-weed-in-seattle-5-reasons-to-choose-marijuana-over-alcohol", destination: "/blog", permanent: true },
      { source: "/cannabis-coffee-wake-and-bake-without-the-grogginess", destination: "/blog", permanent: true },
      { source: "/celebrate-420-with-scc", destination: "/blog", permanent: true },
      { source: "/cooking-with-marijuana-how-to-make-weed-edibles", destination: "/blog/how-to-make-cannabis-edibles", permanent: true },
      { source: "/double-delicious", destination: "/blog", permanent: true },
      { source: "/grand-opening-this-saturday-february-28-2015", destination: "/blog", permanent: true },
      { source: "/harmony-farms", destination: "/blog", permanent: true },
      { source: "/hempfest-2016", destination: "/blog", permanent: true },
      { source: "/house-of-cultivar", destination: "/blog", permanent: true },
      // Restored content — these legacy URLs ranked in March 2026; instead of
      // redirecting to /blog index, we ported the content to /blog/[slug] in
      // SCC voice (no efficacy claims, no profanity, WAC 314-55-155 compliant).
      { source: "/how-to-make-marijuana-butter-cooking-weed-butter", destination: "/blog/how-to-make-cannabis-butter", permanent: true },
      { source: "/how-to-make-marijuana-cookies-cooking-weed-cookies", destination: "/blog/how-to-make-cannabis-cookies", permanent: true },
      { source: "/how-to-roll-a-blunt-blunt-rolling-directions", destination: "/blog/how-to-roll-a-blunt", permanent: true },
      { source: "/marijuana-pipes-how-to-smoke-from-and-use-a-weed-pipe", destination: "/blog/how-to-use-a-cannabis-pipe", permanent: true },
      { source: "/marijuana-vaporizers-the-benefits-of-a-weed-vaporizer", destination: "/blog/cannabis-vaporizers-explained", permanent: true },
      // Slug rename: vendor-spotlight-template → how-we-pick-our-producers
      // (the original "template" suffix screamed dev-placeholder; renamed to a
      // descriptive slug. Original URL preserved via 308 to avoid breaking
      // any inbound links from the past 2 weeks the post has been live.)
      { source: "/blog/vendor-spotlight-template", destination: "/blog/how-we-pick-our-producers", permanent: true },
      { source: "/incredible-edibles-where-to-buy-edibles-in-seattle", destination: "/blog", permanent: true },
      { source: "/individual-care-and-exceptional-experience-is-our-goal-at-seattle-cannabis-co-marijuana-store", destination: "/blog", permanent: true },
      { source: "/interview-with-cannabis-update", destination: "/blog", permanent: true },
      { source: "/is-marijuana-legal-in-seattle-yes-how-to-buy-marijuana-in-seattle", destination: "/blog/is-cannabis-legal-in-seattle", permanent: true },
      { source: "/lighting-weed-lighters-hemp-wicks-matches", destination: "/blog/lighting-cannabis-flower", permanent: true },
      { source: "/marijuana-breath-tests-currently-in-development-at-washington-state-university", destination: "/blog", permanent: true },
      { source: "/marijuana-inspired-christmas-holiday-stoner-gifts", destination: "/blog", permanent: true },
      // /marijuana-pipes + /marijuana-vaporizers upgraded to specific posts above (v8.295).
      { source: "/marijuana-seattle-how-to-purchase-marijuana-in-seattle-legally", destination: "/blog/is-cannabis-legal-in-seattle", permanent: true },

      // ── SEO recovery: legacy iHeartJane menu URLs (Doug 2026-05-08)
      // /menu-scc + /menu-scc-3 were the old iHJ subdir paths; Wayback
      // confirmed dozens of /menu-scc-3/menu/products/<id>/<slug>/ URLs
      // were crawled in March 2026 (each individual product detail had
      // its own SEO landing). All collapse to /menu (the live Boost embed).
      { source: "/menu-scc-3/:path*", destination: "/menu", permanent: true },
      { source: "/menu-scc/:path*", destination: "/menu", permanent: true },
      { source: "/menu/products/:path*", destination: "/menu", permanent: true },

      // ── SEO recovery: WordPress structural URLs (Doug 2026-05-08)
      { source: "/home", destination: "/", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/medical", destination: "/faq", permanent: true },
      { source: "/hello-world", destination: "/blog", permanent: true },
      { source: "/my-account/:path*", destination: "/account", permanent: true },
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
    ];
  },
};

export default nextConfig;
