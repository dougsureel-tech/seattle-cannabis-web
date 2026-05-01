import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

export const alt = `${STORE.name} — Cannabis Dispensary in ${STORE.neighborhood}, Seattle WA`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
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
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(129,140,248,0.25), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 14, height: 14, borderRadius: 99,
              background: "#a5b4fc",
              boxShadow: "0 0 24px #a5b4fc",
            }}
          />
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#c7d2fe" }}>
            {STORE.neighborhood} · Seattle
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>
            {STORE.name}
          </div>
          <div style={{ fontSize: 36, color: "#c7d2fe", fontWeight: 500, maxWidth: 900 }}>
            Veteran-owned · 8 AM–11 PM daily
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
          <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#a5b4fc", fontWeight: 600 }}>
            <span>Cash only</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>21+</span>
            <span style={{ color: "#818cf8" }}>·</span>
            <span>Free parking</span>
          </div>
          <div style={{ fontSize: 20, color: "#c7d2fe", fontWeight: 500 }}>
            seattlecannabis.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
