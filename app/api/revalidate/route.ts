import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

// Timing-safe secret comparison. Sister of inv-App's `verifyBearer`
// in packages/lib-shared/cron-bearer.ts. Length-mismatch short-circuit
// is fine — length isn't a secret; without it timingSafeEqual throws
// on unequal buffer lengths.
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf-8"),
      Buffer.from(expected, "utf-8"),
    );
  } catch {
    return false;
  }
}

// Sister-site revalidation endpoint — paired with inv-App's
// `/api/cron/publish-scheduled-posts` cron (Wave 1 Job #1 of
// PLAN_AUTONOMOUS_CRONS_2026_05_20.md).
//
// Mirror of greenlife-web/app/api/revalidate/route.ts. See that file
// for the full design notes; logic kept byte-identical so a future
// change ports cleanly across both sister sites.
//
// Auth: shared `SISTER_SITE_REVALIDATE_SECRET` env, byte-identical with
// inv-App + glw.
//
// Safe-paths: only "/blog" or "/blog/<slug>" honored.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedPath(path: string): boolean {
  if (path === "/blog") return true;
  if (path.startsWith("/blog/") && !path.includes("..") && !path.includes("//")) return true;
  return false;
}

async function handle(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const path = url.searchParams.get("path");
  const tag = url.searchParams.get("tag");

  const expected = process.env.SISTER_SITE_REVALIDATE_SECRET;
  if (!expected || expected.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!secret || !secretMatches(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }
  if (!isAllowedPath(path)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
  }

  try {
    // Next.js 16: revalidatePath's `type` arg is optional but explicit
    // is clearer. 'page' invalidates the exact path; 'layout' would
    // also invalidate nested routes underneath.
    revalidatePath(path, 'page');
    // Next.js 16: revalidateTag REQUIRES a second 'profile' arg.
    // 'default' = standard cache lifetime. Tag invalidation triggers
    // immediate refetch on next request regardless of profile.
    if (tag) revalidateTag(tag, 'default');
    return NextResponse.json({ ok: true, revalidated: { path, tag: tag ?? null } });
  } catch (err) {
    const errName = err instanceof Error ? err.name : "unknown";
    return NextResponse.json(
      { ok: false, error: `revalidate-failed: ${errName}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
