import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1b4b",
          color: "#a5b4fc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 180, fontWeight: 900 }}>SC</div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
