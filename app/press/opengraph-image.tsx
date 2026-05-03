import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /press OG card — when journalists/bloggers/podcasters share the press
// kit URL, the preview should look professional, fact-first. Mirrors the
// Wenatchee press OG with Seattle's indigo/violet palette.

export const alt = `Press kit · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PressOG() {
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
          background: "#1e1b4b",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(167,139,250,0.12) 0%, transparent 50%)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                Rainier Valley, Seattle
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "8px 16px",
              border: "1.5px solid #a78bfa",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              color: "#a78bfa",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Press · Media Kit
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
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "white",
            }}
          >
            Press resources for
          </span>
          <span
            style={{
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "#c4b5fd",
              marginTop: 4,
            }}
          >
            Seattle Cannabis Co.
          </span>
          <span style={{ fontSize: 26, color: "#ddd6fe", marginTop: 22, fontWeight: 500, lineHeight: 1.3 }}>
            Logo · photos · fact sheet · founder quote · contact
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
            seattlecannabis.co/press
          </span>
          <span style={{ fontSize: 18, color: "#a78bfa", fontWeight: 600 }}>
            Founded 2010 · WSLCB License {STORE.wslcbLicense}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
