import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { NEAR_TOWNS, getTown } from "@/lib/near-towns";

// Per-route OG card for /near/<area>. Sister-shape with the root
// homepage OG (indigo→violet base + radial indigo-fuchsia wash + dot
// brand mark + URL footer) — the only thing that swaps per page is
// the big headline (neighborhood name), the drive-time + transit
// subtitle, and the bottom-right URL slug.
//
// Static-bake friendly: generateImageMetadata enumerates one entry
// per NEAR_TOWNS slug so Next pre-renders every card at build time.
// /near/[town] sets dynamicParams=false so unknown slugs 404 before
// reaching this generator.
//
// Visual language: matches the /near hero band redesign (scc v26.005 —
// indigo-violet hero with eyebrow + h1 + drive-time tile) so the share
// card carries the same identity as the page it previews.
//
// WAC 314-55-155: card text is descriptive only — drive-time + transit
// + neighborhood name. No effect/medical/promotional claims.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return NEAR_TOWNS.map((t) => ({
    id: t.slug,
    alt: `${t.name} → ${STORE.name} · ${t.driveMins} min`,
    size,
    contentType,
  }));
}

export default async function OG({ params }: { params: Promise<{ town: string }> }) {
  const { town: slug } = await params;
  const area = getTown(slug) ?? NEAR_TOWNS[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Same radial mesh as the homepage card — indigo glow top-right,
            fuchsia wash bottom-left. Carries depth identity across the
            whole OG family. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(129,140,248,0.30), transparent 60%), radial-gradient(circle at 15% 90%, rgba(232,121,249,0.18), transparent 55%)",
          }}
        />

        {/* Top-left brand mark — dot + store name + neighborhood eyebrow. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 99,
              background: "#a5b4fc",
              boxShadow: "0 0 24px #a5b4fc",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{STORE.name}</span>
            <span
              style={{
                fontSize: 15,
                color: "#c7d2fe",
                marginTop: 2,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Near you · {STORE.neighborhood}
            </span>
          </div>
        </div>

        {/* Middle — big page-specific headline + drive-time/transit subtitle. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            position: "relative",
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#fcd34d",
            }}
          >
            Dispensary near
          </div>
          <div
            style={{
              fontSize: area.name.length > 14 ? 108 : 124,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "white",
            }}
          >
            {area.name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#c7d2fe",
              fontWeight: 500,
              lineHeight: 1.3,
              maxWidth: 1000,
            }}
          >
            {area.driveMins} min · {area.transit}
          </div>
        </div>

        {/* Bottom — fact strip + URL slug. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 22,
              fontSize: 20,
              color: "#a5b4fc",
              fontWeight: 600,
            }}
          >
            <span>Open daily</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>Cash only · ATM on site</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>21+</span>
          </div>
          <div style={{ fontSize: 20, color: "#c7d2fe", fontWeight: 600 }}>
            seattlecannabis.co/near/{area.slug}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        // Layered cache headers per the v25.925 perf-bundle fix — Next 16
        // silently strips s-maxage from custom Cache-Control on metadata
        // image routes, so pair `Cache-Control` (browser respects) with
        // `Vercel-CDN-Cache-Control` (Vercel CDN respects, untouched by
        // the metadata-image pipeline). Area data is static SSoT so 1-day
        // browser + 1-day edge with 1-week SWR is safe.
        "Cache-Control": "public, max-age=86400",
        "Vercel-CDN-Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
