import { NextResponse } from "next/server";

// Diagnostic-only endpoint — calls api.iheartjane.com/v1/whoami from Vercel's
// serverless egress (NOT a customer's browser) to test whether iHeartJane is
// reachable from our server. Vercel egress IPs aren't on consumer ad-blocker
// lists, so a 200 here confirms the API is healthy and the live failure is
// client-side (browser extension, DNS filter, or Cloudflare-CLI bot detection).
//
// MENU_LOG hypothesis #6 — counterpart to the "Provisional headers are shown"
// finding from Doug's DevTools screenshot. NOT customer-facing — leading
// underscore on the route segment + force-dynamic + no caching.
//
// Remove this route once the /menu issue is closed; it's diagnostic scaffold,
// not product surface.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = "https://api.iheartjane.com/v1/whoami";
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
        Origin: "https://seattlecannabis.co",
        Referer: "https://seattlecannabis.co/menu",
      },
      cache: "no-store",
    });
    const ms = Date.now() - t0;
    const body = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v;
    });
    return NextResponse.json(
      {
        url,
        status: res.status,
        latencyMs: ms,
        responseHeaders: headers,
        bodyPreview: body.slice(0, 500),
        bodyLength: body.length,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const ms = Date.now() - t0;
    return NextResponse.json(
      {
        url,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: ms,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
