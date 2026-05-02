import { ImageResponse } from "next/og";
import { getDealById } from "@/lib/db";
import { STORE } from "@/lib/store";

// Per-deal OG image. Deal links get shared a LOT (SMS forwards, IG
// stories, neighborhood Discord/Slack groups). Without this every share
// unfurled with the same site-wide OG; now the recipient sees the actual
// deal — "20% off Flower · ends Sat" — at a glance.

export const alt = "Deal at Seattle Cannabis Co.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fmtEndDate(iso: string | null): string {
  if (!iso) return "Ongoing — no end date";
  const d = new Date(`${iso}T12:00:00`);
  return `Ends ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
}

export default async function DealOG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDealById(id).catch(() => null);

  const headline = deal?.short ?? "Deals";
  const sub = deal?.name ?? "Browse current deals";
  const endLine = deal ? fmtEndDate(deal.endDate) : "";

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
              color: "#fde68a",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            🔥 Deal
          </span>
          <span
            style={{
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 0.95,
              color: "white",
            }}
          >
            {headline}
          </span>
          {sub !== headline && (
            <span
              style={{
                fontSize: 30,
                color: "#c7d2fe",
                marginTop: 18,
                fontWeight: 500,
              }}
            >
              {sub}
            </span>
          )}
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
            seattlecannabis.co/deals
          </span>
          <span style={{ fontSize: 22, color: deal?.endDate ? "#fde047" : "#a5b4fc", fontWeight: 700 }}>
            {endLine || "21+ · Cash only · Open until 11"}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
