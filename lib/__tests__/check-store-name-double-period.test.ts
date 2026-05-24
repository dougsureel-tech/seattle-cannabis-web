// Pin tests for scripts/check-store-name-double-period.mjs.
//
// 50th (FINAL) gate in the SCC marathon-port arc — SCC-ONLY (glw has
// STORE.name = "Green Life Cannabis" with no trailing period).
// fs-source-assertion pattern.
//
// Doctrine: SCC's STORE.name = "Seattle Cannabis Co." (ends with
// abbreviation period). Any `${STORE.name}.` interpolation produces
// "Co.." in customer-facing SERP descriptions, share-card text, and
// AI-search citations.
//
// v21.905 sweep: 11 SERP-visible descriptions fixed across /menu +
// homepage + /community + /blog + etc.
//
// THIS IS GATE 50/50 — completes the SCC marathon-port to 100% AND
// closes the cannabis-web fleet marathon at 99/99 (GLW 49 + SCC 50).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-store-name-double-period.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-store-name-double-period.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-store-name-double-period — v21.905 11-site sweep anchor preserved", () => {
  assert.match(GATE_SRC, /v21\.905/, "v21.905 sweep ship anchor");
  assert.match(GATE_SRC, /11\s+SERP-visible/i, "11-site sweep magnitude");
});

test("check-store-name-double-period — STORE.name root-cause documented (Seattle Cannabis Co.)", () => {
  // THE root cause: brand-name itself ends with period.
  assert.match(
    GATE_SRC,
    /Seattle\s+Cannabis\s+Co\./,
    "Seattle Cannabis Co. brand name anchored",
  );
  assert.match(
    GATE_SRC,
    /abbreviation\s+period/i,
    "abbreviation-period root-cause rationale",
  );
});

test("check-store-name-double-period — `Co..` double-period failure mode documented", () => {
  // The visible-to-customer artifact.
  assert.match(
    GATE_SRC,
    /Co\.\./,
    "Co.. double-period rendered output pinned",
  );
});

test("check-store-name-double-period — 3 customer-visible surface anchors (SERP + share-cards + AI-citations)", () => {
  // The 3 surfaces where the double-period lands visibly.
  assert.match(GATE_SRC, /SERP/, "SERP surface anchor");
  assert.match(
    GATE_SRC,
    /share-card/i,
    "share-card surface anchor",
  );
  assert.match(
    GATE_SRC,
    /AI-(?:search|citation)/i,
    "AI-search-citation surface anchor",
  );
});

test("check-store-name-double-period — glw-doesn't-need-this rationale documented", () => {
  // Why this gate is SCC-only — glw STORE.name has no trailing period.
  assert.match(
    GATE_SRC,
    /Green\s+Life\s+Cannabis/,
    "Green Life Cannabis (glw STORE.name) referenced",
  );
  assert.match(
    GATE_SRC,
    /no\s+trailing\s+period/i,
    "glw no-trailing-period rationale",
  );
});

test("check-store-name-double-period — PATTERN regex distinguishes text-period from property-access", () => {
  // CRITICAL: `${STORE.name}.foo` (property access) must NOT match;
  // only `${STORE.name}.` followed by whitespace/quote/end-of-string
  // counts as text-period. Pin the discriminating lookbehind shape.
  assert.match(
    GATE_SRC,
    /PATTERN\s*=\s*\/\\\$\\\{STORE\\\.name\\\}\\\.\(\?:\\s\|`\|"\|'\|\$\)/,
    "PATTERN regex shape (text-period vs property-access) pinned exact",
  );
});

test("check-store-name-double-period — EXEMPT_FILES = version.ts (changelog references)", () => {
  // Changelog historically references the pattern in prose.
  assert.match(
    GATE_SRC,
    /"lib\/version\.ts"/,
    "lib/version.ts EXEMPT pinned (changelog refs)",
  );
});

test("check-store-name-double-period — self-exempt for script-relocation defense", () => {
  // The script exempts ITSELF in case it ever moves into a scanned dir.
  assert.match(
    GATE_SRC,
    /"scripts\/check-store-name-double-period\.mjs"/,
    "self-exempt path pinned",
  );
});

test("check-store-name-double-period — SCAN_DIRS = app + lib + components", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"lib",\s*"components"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-store-name-double-period — fix-recipe: drop redundant `.` (STORE.name provides period)", () => {
  // Self-documenting fix.
  assert.match(
    GATE_SRC,
    /redundant\s+['`"]?\.\s*['`"]?/,
    "redundant-period fix recipe pinned",
  );
});

test("check-store-name-double-period — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(WARN_ONLY \? 0 : 1\)/,
    "default-strict exit policy pinned",
  );
});
