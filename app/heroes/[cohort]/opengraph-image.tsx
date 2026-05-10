import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// Per-cohort OG share card. Sister of glw v19.705 — same dynamic-route
// convention pattern, scc indigo/violet/fuchsia palette mirroring the
// parent /heroes OG. Pre-T99 every /heroes/[cohort] page fell back to
// the generic homepage OG; now veterans/military/first-responders/
// healthcare/teachers each get their own cohort-themed share-card.

export const alt = `Heroes Discount · 30% off · Seattle Cannabis Co.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COHORT_LABELS: Record<string, { label: string; tagline: string }> = {
  veterans: { label: "Veterans", tagline: "Thank you for your service." },
  military: { label: "Active Military", tagline: "On post or off — we've got you." },
  "first-responders": { label: "First Responders", tagline: "You answered the call." },
  healthcare: { label: "Healthcare Workers", tagline: "You took care of us." },
  teachers: { label: "Teachers", tagline: "You showed up every day." },
};

export default async function HeroesCohortOG({ params }: { params: Promise<{ cohort: string }> }) {
  const { cohort } = await params;
  const data = COHORT_LABELS[cohort] ?? { label: "Local Heroes", tagline: "We thank you." };
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
            right: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(232,121,249,0.20) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
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
              {STORE.address.city}, WA
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
            {data.label} · 30% off
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              color: "white",
            }}
          >
            {data.tagline}
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
            seattlecannabis.co/heroes/{cohort}
          </span>
          <span style={{ fontSize: 18, color: "#f0abfc", fontWeight: 600 }}>
            Show ID at the register
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      // T105 fix sister of glw — proven blog OG pattern.
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
