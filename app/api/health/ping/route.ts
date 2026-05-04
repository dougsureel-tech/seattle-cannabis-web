import { NextRequest, NextResponse } from "next/server";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { STORE } from "@/lib/store";
import { getClient } from "@/lib/db";

// Mirror of greenlife-web/app/api/health/ping/route.ts. Minimal
// liveness endpoint — no DB hit by default. Optional `?verbose=1`
// adds productsActive + dealsActive content counts.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkContentLite(): Promise<{
  productsActive: number;
  dealsActive: number;
} | null> {
  try {
    const sql = getClient();
    const [p, d] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM products WHERE carry_status = 'active'`,
      sql`SELECT COUNT(*)::int AS n FROM deals
          WHERE status = 'active'
            AND (start_date IS NULL OR start_date <= CURRENT_DATE)
            AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
    ]);
    return {
      productsActive: (p as Array<{ n: number }>)[0]?.n ?? 0,
      dealsActive: (d as Array<{ n: number }>)[0]?.n ?? 0,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const verbose = req.nextUrl.searchParams.get("verbose") === "1";
  const content = verbose ? await checkContentLite() : null;

  return NextResponse.json(
    {
      ok: true,
      version: BUILD_VERSION,
      sha: BUILD_SHA,
      ts: new Date().toISOString(),
      ...(verbose ? { content } : {}),
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
