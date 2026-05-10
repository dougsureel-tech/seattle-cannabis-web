import { ImageResponse } from "next/og";

// Favicon-tier 32×32 icon — Next 16 file convention. Generates /icon and
// auto-emits `<link rel="icon" type="image/png" sizes="32x32">` site-wide.
// Pre-v13.X only public/favicon.ico existed → browsers without strong .ico
// support fell back to a downscaled 256×256 .ico (decode quality varies).
// Sister glw v15.X + GW src/app/icon.tsx — cross-stack symmetric. Caught
// 2026-05-10 by /loop tick 37 favicon-completeness audit.

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1e1b4b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a78bfa",
          fontSize: 22,
          fontFamily: "Georgia, serif",
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
