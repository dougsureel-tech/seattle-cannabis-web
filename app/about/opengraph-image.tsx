import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /about is the trust-decision page for first-time visitors. Per-page OG
// card leans into Seattle's "founded 2010, Rainier Valley since 2018"
// positioning that's a decade ahead of most WA dispensaries.

export const alt = `About ${STORE.name} — Rainier Valley's neighborhood cannabis dispensary since 2018`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function AboutOG() {
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
          background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #4338ca 100%)",
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
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)",
            transform: "translate(-25%, -25%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(232,121,249,0.14) 0%, transparent 70%)",
            transform: "translate(25%, 25%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#4338ca",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            🌿
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>{STORE.name}</span>
            <span style={{ fontSize: 18, color: "#c4b5fd", marginTop: 2 }}>
              Cannabis dispensary · Rainier Valley
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: "#f0abfc",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            About Seattle Cannabis Co.
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "white",
            }}
          >
            Same crew since 2010.
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "#c4b5fd",
            }}
          >
            Locally rooted.
          </span>
          <span style={{ fontSize: 28, color: "#ddd6fe", marginTop: 18, fontWeight: 600, lineHeight: 1.3 }}>
            Founded 2010 · Rainier Valley since 2018 · Curated catalog
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid rgba(196,181,253,0.25)",
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 22, color: "#c4b5fd", fontWeight: 600 }}>
            seattlecannabis.co/about
          </span>
          <span style={{ fontSize: 18, color: "#a78bfa", fontWeight: 600 }}>
            16+ years · Rainier Ave S · WSLCB {STORE.wslcbLicense}
          </span>
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
