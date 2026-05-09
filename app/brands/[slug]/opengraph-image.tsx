import { ImageResponse } from "next/og";
import { getBrandBySlug } from "@/lib/db";
import { STORE } from "@/lib/store";

// Cache OG image at CDN edge for 24h, stale 7d. Pattern matches
// inv v342.405 /api/og — `revalidate` export alone doesn't apply to
// ImageResponse; setting headers in options object is what works.
const OG_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
};

// Per-brand OG image — generated on demand at /brands/<slug>/opengraph-image.
// Fixes the link-unfurl story: when a customer/influencer/press shares a
// brand link on Instagram/iMessage/Twitter, they get a clean branded card
// (brand name + "live at Seattle Cannabis Co." + product count) instead of
// the generic site-wide OG. SEO win too — Google indexes the image as the
// page's primary social card.

export const alt = "Brand at Seattle Cannabis Co.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BrandOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);

  const brandName = brand?.name ?? "Brands";
  const skuCount = brand?.activeSkus ?? 0;
  const skuLine = brand
    ? `${skuCount} product${skuCount !== 1 ? "s" : ""} in stock`
    : "Browse our brands";

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
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            SC
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>{STORE.name}</span>
            <span style={{ fontSize: 18, color: "#c7d2fe", marginTop: 2 }}>
              Cannabis dispensary · {STORE.neighborhood}, Seattle
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          <span
            style={{
              fontSize: 26,
              color: "#a5b4fc",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Now stocked
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1,
              color: "white",
            }}
          >
            {brandName}
          </span>
          <span
            style={{
              fontSize: 32,
              color: "#c7d2fe",
              marginTop: 16,
              fontWeight: 500,
            }}
          >
            {skuLine}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid rgba(165,180,252,0.25)",
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 22, color: "#a5b4fc", fontWeight: 600 }}>
            seattlecannabis.co/brands/{brand?.slug ?? slug}
          </span>
          <span style={{ fontSize: 18, color: "#818cf8", fontWeight: 600 }}>
            21+ · Cash only · Open 8 AM–11 PM
          </span>
        </div>
      </div>
    ),
    { ...size, headers: OG_CACHE_HEADERS },
  );
}
