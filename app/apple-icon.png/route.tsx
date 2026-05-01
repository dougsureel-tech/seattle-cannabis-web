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
          background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
          color: "#a5b4fc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 900 }}>SC</div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
