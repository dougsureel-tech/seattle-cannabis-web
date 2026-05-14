import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { LEARN_HUB_TOPICS, getLearnHubTopic } from "@/lib/learn-hub";

// Per-route OG card for /learn/<slug>. Sister of /near/[town] +
// /strains/[type] — same indigo→violet hero band identity, dot brand
// mark, page-specific topic title + eyebrow kicker pulled from
// LEARN_HUB_TOPICS.
//
// Static-bake friendly: generateImageMetadata enumerates each topic slug
// so Next pre-renders cards at build time. dynamicParams=false on
// /learn/[slug] keeps unknown slugs from reaching this generator.
//
// WAC 314-55-155: card text is educational/descriptive only. Title and
// eyebrow come straight from the SSoT — same copy that survived the
// long-form body's compliance lane (no effect/medical/promissory claims).

export const alt = `${STORE.name} — Cannabis 101 long-form guide`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getLearnHubTopic(slug) ?? LEARN_HUB_TOPICS[0];

  // The topic title is up to ~70 chars; ramp the type size by length so
  // the longest titles still fit inside the 1040-wide content area.
  const titleSize =
    topic.title.length > 56 ? 64 : topic.title.length > 40 ? 76 : 92;

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
              Cannabis 101 · Long-form guide
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
            {topic.eyebrow}
          </div>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              color: "white",
            }}
          >
            {topic.title}
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
            <span>Read at the counter</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>Rainier Valley</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>21+</span>
          </div>
          <div style={{ fontSize: 20, color: "#c7d2fe", fontWeight: 600 }}>
            seattlecannabis.co/learn/{topic.slug}
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
