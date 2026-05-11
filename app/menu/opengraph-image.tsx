import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// Per-route OG card for /menu — Seattle indigo palette, matching the
// homepage hero v2 energy. Headline + subtitle swapped so a "here's the
// menu" share preview reads as the menu, not the brand front door.
// Right-side category pills replace the homepage's neighborhood tag.
// Sister of greenlife-web/app/menu/opengraph-image.tsx — different brand
// + palette + initials. Ports the same template family.

export const alt = `Cannabis menu — order ahead for cash pickup at ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_PILLS = ["Flower", "Pre-rolls", "Vapes", "Edibles"];

export default function MenuOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 0,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)",
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
              "radial-gradient(circle at 80% 20%, rgba(129,140,248,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(232,121,249,0.18), transparent 50%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 70px 60px 80px",
            width: 760,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "linear-gradient(135deg, #4338ca, #6366f1)",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: -1,
                color: "white",
                boxShadow: "0 8px 32px rgba(129,140,248,0.40)",
              }}
            >
              SCC
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>{STORE.name}</span>
              <span style={{ fontSize: 17, color: "#a5b4fc", marginTop: 2, letterSpacing: 1 }}>
                {`Live Menu · ${STORE.neighborhood} · Seattle`}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 78,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2.5,
                color: "white",
              }}
            >
              Order ahead · pickup in 10 min
            </div>
            <div style={{ fontSize: 26, color: "#c7d2fe", fontWeight: 500, lineHeight: 1.3 }}>
              Live inventory, real lab data, 100+ Washington producers
            </div>

            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(99,102,241,0.20)",
                border: "1px solid rgba(129,140,248,0.45)",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: "#a5b4fc",
                  boxShadow: "0 0 16px #a5b4fc",
                }}
              />
              <span style={{ fontSize: 20, fontWeight: 700, color: "#c7d2fe" }}>
                16+ years in cannabis · open since 2010
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 18, color: "#a5b4fc", fontWeight: 600 }}>
              {`${STORE.address.street} · ${STORE.address.city}, WA`}
            </div>
            <div style={{ fontSize: 22, color: "#c7d2fe", fontWeight: 700 }}>
              seattlecannabis.co/menu
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "70px 70px 60px 30px",
            flex: 1,
            borderLeft: "1px solid rgba(129,140,248,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: "#e879f9",
                boxShadow: "0 0 12px rgba(232,121,249,0.7)",
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#f0abfc",
              }}
            >
              Shop by category
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            {CATEGORY_PILLS.map((cat) => (
              <div
                key={cat}
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(199,210,254,0.28)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
