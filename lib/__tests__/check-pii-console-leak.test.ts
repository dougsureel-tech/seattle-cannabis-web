// Pin tests for scripts/check-pii-console-leak.mjs.
//
// 35th gate in the SCC marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — Vercel logs are NOT BAA-covered):
// `console.error("...", err)` where err is the raw Error object leaks
// PII. SDK errors echo customer-bound parameters (email/phone/order
// data) into err.message. Vercel function logs are NOT BAA-covered.
//
// NOTE: SCC version is INTENTIONALLY thinner than glw's — uses single
// RAW_ERR_RE only (no MSG_INTERP_RE or STRING_FALLBACK_RE) because SCC
// has legit `: String(err)` ternary fallbacks where the err.name path
// already guards (the safe pattern in /account/orders + /order/
// confirmation pages). When SCC code is refactored away from that
// pattern, this gate can be upgraded to match glw's coverage.
//
// Class history (ported from cannagent v3.350 → v4.835).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-pii-console-leak.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-pii-console-leak.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-pii-console-leak — Vercel-NOT-BAA-covered doctrine preserved", () => {
  assert.match(
    GATE_SRC,
    /NOT\s+BAA-covered/i,
    "Vercel-NOT-BAA-covered anchor",
  );
  assert.match(GATE_SRC, /PII/, "PII leak class named");
});

test("check-pii-console-leak — class history anchors (v3.350 + v4.235-v4.835 cannagent port)", () => {
  assert.match(GATE_SRC, /v3\.350/, "v3.350 anchor");
  assert.match(GATE_SRC, /v4\.235/, "v4.235 anchor");
  assert.match(GATE_SRC, /v4\.835/, "v4.835 anchor");
});

test("check-pii-console-leak — RAW_ERR_RE detection pinned (8 error-var names)", () => {
  assert.match(GATE_SRC, /RAW_ERR_RE/, "RAW_ERR_RE regex named");
  for (const name of [
    "err",
    "error",
    "caught",
    "rowErr",
    "sendErr",
    "fetchErr",
    "dbErr",
    "parseErr",
  ]) {
    assert.ok(
      GATE_SRC.includes(name),
      `error-var name ${name} must be in detection`,
    );
  }
});

test("check-pii-console-leak — fix-recipe: err.name OR String(err) — last resort", () => {
  assert.match(
    GATE_SRC,
    /err\s+instanceof\s+Error\s*\?\s*err\.name/,
    "fix recipe: err instanceof Error ? err.name pinned",
  );
});

test("check-pii-console-leak — SCAN_DIRS = app + components + lib", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-pii-console-leak — walker excludes __tests__ + .test/.spec (self-trip defense)", () => {
  assert.match(GATE_SRC, /entry === "__tests__"/, "__tests__ dir skip");
  assert.match(GATE_SRC, /\.endsWith\(["']\.test\.ts["']\)/, ".test.ts skip");
  assert.match(GATE_SRC, /\.endsWith\(["']\.spec\.ts["']\)/, ".spec.ts skip");
});

test("check-pii-console-leak — fail-loud exit 1 (HIGH-STAKES — no --warn opt-out)", () => {
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1");
  assert.ok(
    !GATE_SRC.includes("--warn"),
    "no --warn opt-out (HIGH-STAKES PII gate)",
  );
});
