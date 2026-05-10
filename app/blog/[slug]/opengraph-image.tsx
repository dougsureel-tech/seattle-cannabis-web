import { ImageResponse } from "next/og";
import { getPost, fetchDynamicPost } from "@/lib/posts";
import { STORE } from "@/lib/store";

// Cache OG image at CDN edge for 24h, stale 7d. Pattern matches
// inv v342.405 /api/og — `revalidate` export alone doesn't apply to
// ImageResponse; setting headers in options object is what works.
const OG_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
};

// Per-post OG image. Blog posts get shared by the press/influencer
// audience (someone writing about cannabis education citing our guide).
// Per-post image puts the headline in the card so the link reads as
// content, not as a generic site nav crumb.

export const alt = "Cannabis guide at Seattle Cannabis Co.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_TONE: Record<string, { eyebrow: string; emoji: string }> = {
  Guide: { eyebrow: "Guide", emoji: "📘" },
  "Vendor Spotlight": { eyebrow: "Vendor Spotlight", emoji: "🌿" },
  Education: { eyebrow: "Cannabis 101", emoji: "🎓" },
  Local: { eyebrow: "Local", emoji: "🏙️" },
};

export default async function PostOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug) ?? (await fetchDynamicPost(slug));

  const title = post?.title ?? "Cannabis guides";
  const description = post?.description ?? "Education, vendor spotlights, and local guides.";
  const eyebrowKey = post?.category ?? "Guide";
  const tone = CATEGORY_TONE[eyebrowKey] ?? CATEGORY_TONE.Guide;
  const minsLine = post?.readingMinutes ? `${post.readingMinutes} min read` : "";

  const titleSize = title.length > 70 ? 64 : title.length > 45 ? 76 : 92;

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
              fontSize: 24,
              color: "#a5b4fc",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {tone.emoji} {tone.eyebrow}
            {minsLine && <span style={{ color: "#818cf8", marginLeft: 12 }}>· {minsLine}</span>}
          </span>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              color: "white",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#c7d2fe",
              marginTop: 18,
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            {description.length > 110 ? description.slice(0, 107) + "…" : description}
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
            seattlecannabis.co/blog/{slug}
          </span>
          <span style={{ fontSize: 18, color: "#818cf8", fontWeight: 600 }}>21+ · Cash only</span>
        </div>
      </div>
    ),
    { ...size, headers: OG_CACHE_HEADERS },
  );
}
