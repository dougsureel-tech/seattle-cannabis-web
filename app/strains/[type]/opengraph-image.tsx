import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { STRAIN_TYPES, getStrainType } from "@/lib/strain-types";

// Per-route OG card for /strains/<type>. Sister of the /near/[town]
// per-route card — indigo→violet hero band identity, dot brand mark,
// drive-time tile swapped for a strain-category subhead pulled from
// STRAIN_TYPES SSoT.
//
// Static-bake friendly: generateImageMetadata enumerates the 4 slugs
// (indica / sativa / hybrid / cbd) so Next pre-renders each card at
// build time. dynamicParams=false on /strains/[type] keeps unknown
// slugs from reaching this generator.
//
// WAC 314-55-155: card text is descriptive only — botanical name +
// shelf-category framing. NO effect/medical/promotional claims. Pulls
// subhead directly from the SSoT — same lane as the on-page body copy.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return STRAIN_TYPES.map((t) => ({
    id: t.slug,
    alt: `${t.name} strains at ${STORE.name} · ${t.subhead}`,
    size,
    contentType,
  }));
}

export default async function OG({ params }: { params: Promise<{ type: string }> }) {
  const { type: slug } = await params;
  const t = getStrainType(slug) ?? STRAIN_TYPES[0];

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
              {t.eyebrow}
            </span>
          </div>
        </div>

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
            Strain category
          </div>
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -4,
              color: "white",
            }}
          >
            {t.name}
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
            {t.subhead}
          </div>
        </div>

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
            <span>Flower</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>Pre-rolls</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>Vapes</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>Edibles</span>
          </div>
          <div style={{ fontSize: 20, color: "#c7d2fe", fontWeight: 600 }}>
            seattlecannabis.co/strains/{t.slug}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Vercel-CDN-Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
