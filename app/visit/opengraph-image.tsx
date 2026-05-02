import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /visit gets shared a lot ("here's where to go") — SMS forwards, group
// chats, "let's stop on the way" texts. Per-page OG turns those shares
// into real previews with the actual address and phone right in the card.

export const alt = `Visit ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function VisitOG() {
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
            📍 Visit us
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: 1.05,
              color: "white",
            }}
          >
            {STORE.address.street}
          </span>
          <span style={{ fontSize: 36, color: "#c7d2fe", marginTop: 8, fontWeight: 600 }}>
            {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
          </span>
          <span style={{ fontSize: 28, color: "#a5b4fc", marginTop: 18, fontWeight: 600 }}>
            {STORE.phone} · Open 8 AM – 11 PM daily
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
            seattlecannabis.co/visit
          </span>
          <span style={{ fontSize: 18, color: "#818cf8", fontWeight: 600 }}>
            Othello Light Rail · Free parking · ATM
          </span>
        </div>
      </div>
    ),
    size,
  );
}
