// Source-defense pin for `proxy.ts` (root-level Next.js middleware).
//
// Why pin: v21.705 shipped the CANONICAL_HOST allow-list defense after
// finding that pre-fix `proxy.ts` read `NEXT_PUBLIC_CANONICAL_HOST` env
// with ZERO validation. If env drifted to a typo'd value (e.g.
// `app.seattlecannabis.co`), every non-canonical request would 308-
// redirect to that broken host = SITE-WIDE OUTAGE. Higher-impact than
// the email-defense sites because the redirect target affects every
// page load, not just outbound CTAs.
//
// The existing `check-site-url-defense.mjs` arc-guard does NOT cover
// `proxy.ts` (it scans for the inline `||` pattern in app/lib/components
// and proxy.ts lives at root). This test is the only gate enforcing the
// allow-list shape stays in place.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROXY_SRC = readFileSync(join(__dirname, "..", "..", "proxy.ts"), "utf-8");

describe("proxy.ts — CANONICAL_HOST allow-list defense (v21.705)", () => {
  test("declares ALLOWED_CANONICAL_HOSTS Set with the canonical hostname", () => {
    assert.match(
      PROXY_SRC,
      /const ALLOWED_CANONICAL_HOSTS\s*=\s*new Set\(\[[\s\S]{0,200}"www\.seattlecannabis\.co"/,
      "proxy.ts must declare ALLOWED_CANONICAL_HOSTS Set containing the canonical www hostname",
    );
  });

  test("CANONICAL_HOST is computed via IIFE that validates env against the allow-list", () => {
    assert.match(
      PROXY_SRC,
      /const CANONICAL_HOST\s*=\s*\(\(\)\s*=>\s*\{[\s\S]{0,400}ALLOWED_CANONICAL_HOSTS\.has\(env\)[\s\S]{0,200}return\s+env/,
      "proxy.ts must validate env via ALLOWED_CANONICAL_HOSTS.has(env) before returning it",
    );
  });

  test("CANONICAL_HOST fallback is the hardcoded canonical (not the unsafe env-or-fallback inline form)", () => {
    assert.match(
      PROXY_SRC,
      /return\s+"https?:\/\/www\.seattlecannabis\.co"|return\s+"www\.seattlecannabis\.co"/,
      "proxy.ts must hardcode the canonical fallback (not interpolate env)",
    );
  });

  test("does NOT use the OLD unsafe form `process.env.NEXT_PUBLIC_CANONICAL_HOST || \"<literal>\"`", () => {
    // Pre-v21.705: `const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || "www.seattlecannabis.co";`
    // — typo'd env would 308-redirect every non-canonical request to broken host.
    assert.ok(
      !/const\s+CANONICAL_HOST\s*=\s*process\.env\.NEXT_PUBLIC_CANONICAL_HOST\s*\|\|\s*["']/.test(PROXY_SRC),
      "proxy.ts regressed to inline `env || literal` — use ALLOWED_CANONICAL_HOSTS allow-list (v21.705)",
    );
  });

  test("ALWAYS_CANONICAL_HOSTS still preserved as belt-and-suspenders (different purpose)", () => {
    // ALLOWED_CANONICAL_HOSTS = which DESTINATION hostnames env can override to
    // ALWAYS_CANONICAL_HOSTS = which SOURCE hostnames never get redirected
    // Both should coexist — orthogonal purposes.
    assert.match(
      PROXY_SRC,
      /const ALWAYS_CANONICAL_HOSTS\s*=\s*new Set\(\[[\s\S]{0,200}"www\.seattlecannabis\.co"/,
      "proxy.ts must keep ALWAYS_CANONICAL_HOSTS as separate belt-and-suspenders defense",
    );
  });
});
