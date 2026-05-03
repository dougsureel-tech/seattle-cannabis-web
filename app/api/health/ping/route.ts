import { NextResponse } from "next/server";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { STORE } from "@/lib/store";

// Mirror of greenlife-web/app/api/health/ping/route.ts. Minimal liveness
// endpoint — no DB hit, for second-bucket uptime monitor pings. See
// PLAN_RELIABILITY.md for the broader reliability stack.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      version: BUILD_VERSION,
      sha: BUILD_SHA,
      ts: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store, must-revalidate",
        "x-health-status": "ok",
        "x-version": BUILD_VERSION,
        "x-sha": BUILD_SHA,
        "x-store-name": STORE.name,
      },
    },
  );
}
