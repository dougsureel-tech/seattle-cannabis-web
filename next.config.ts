import type { NextConfig } from "next";

// Baseline security headers — applied to every response. Light-touch set
// that doesn't break Clerk, Jane Boost, Mapbox, or Algolia (all of which
// inject scripts + iframes that we need). CSP is intentionally NOT here;
// adding one means inventorying every third-party origin we use and
// keeping it in sync — separate task.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // `no-referrer-when-downgrade` (not `strict-origin-when-cross-origin`) —
  // iHeartJane's Boost API uses the Referer for partner allowlisting and
  // silently CORS-rejects requests where Referer was truncated. See
  // greenlife-web/next.config.ts for the full rationale. MENU_LOG hypothesis #4.
  { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // NOTE: do NOT re-add a `redirects()` block here for /menu or /order.
  // /menu must stay on seattlecannabis.co with iHeartJane embedded inline
  // (see app/menu/page.tsx + app/menu/JaneMenu.tsx). A redirect bounces
  // customers off-domain and breaks the embed model.
  //
  // If /menu renders blank, the most common cause is iHeartJane rotated
  // the Boost bundle hash and `BOOST_SCRIPT_URL` in JaneMenu.tsx now 404s.
  // Recovery recipe + diagnostic walk in
  // ~/Documents/CODE/INCIDENTS.md → "Blank /menu after iHeartJane rotated
  // the Boost bundle hash" (2026-05-01). DO NOT bounce customers
  // off-domain as a workaround — find the new hash and redeploy.
};

export default nextConfig;
