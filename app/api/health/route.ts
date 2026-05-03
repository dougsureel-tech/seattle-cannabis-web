import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";

// Mirror of greenlife-web/app/api/health/route.ts. See PLAN_RELIABILITY.md
// for the broader reliability stack (LKG tracking, monitoring, auto-rollback).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult = { ok: true } | { ok: false; error: string };

async function checkDb(): Promise<CheckResult> {
  try {
    const sql = getClient();
    const rows = (await sql`SELECT COUNT(*)::int AS n FROM vendors`) as Array<{ n: number }>;
    if (!rows || rows.length === 0) {
      return { ok: false, error: "vendors query returned no rows" };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message.slice(0, 200) : "unknown db error",
    };
  }
}

export async function GET() {
  const startedAt = Date.now();
  const db = await checkDb();
  const elapsedMs = Date.now() - startedAt;

  const allOk = db.ok;
  const body = {
    ok: allOk,
    version: BUILD_VERSION,
    sha: BUILD_SHA,
    ts: new Date().toISOString(),
    elapsedMs,
    checks: { db },
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      "cache-control": "no-store, must-revalidate",
      "x-health-status": allOk ? "ok" : "degraded",
    },
  });
}
