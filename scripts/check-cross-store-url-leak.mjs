#!/usr/bin/env node
/**
 * Cross-store URL leak arc-guard (Sea — `seattle-cannabis-web`).
 *
 * Pins memory pin `feedback_cross_store_url_leak_pattern` against
 * re-introduction. Real prior incident (2026-05-04): when Sea public
 * site was forked from Wen's, three customer-facing forms
 * inherited Wen's hardcoded `inventoryapp-ivory.vercel.app` URLs:
 *   - `app/apply/page.tsx` (API_URL + POSITIONS_API)
 *   - `app/vendor-access/VendorAccessForm.tsx` (API_URL)
 *   - `app/careers/page.tsx` (POSITIONS_API)
 *
 * Effect: every Seattle applicant landed in Wen's hiring pipeline
 * + Sea's pipeline never saw them. Sea-side admin edits weren't
 * reflected on the live careers list. Silent cross-store data leak;
 * POSTs succeeded into the wrong DB (each store has its own Neon
 * but the API endpoint shape is identical).
 *
 * Fix path: replace `inventoryapp-ivory.vercel.app` → `seattle-cannabis-co.vercel.app`
 * in any hardcoded form URL.
 *
 * Guard rule: NO `inventoryapp-ivory.vercel.app` literal in Sea's
 * app/, lib/, components/. Acceptable in test files, changelog
 * comments, lib/version.ts notes — those don't drive runtime behavior.
 *
 * Sister gate: glw mirror at `greenlife-web/scripts/check-cross-store-url-leak.mjs`.
 *
 * Exits 1 on any hit.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const SCAN_DIRS = [
  join(cwd, "app"),
  join(cwd, "lib"),
  join(cwd, "components"),
];

// Sea code MUST NOT reference Wen's canonical inv URL.
const WRONG_URL = "inventoryapp-ivory.vercel.app";

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__" || name.startsWith(".")) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (st.isFile() && /\.(ts|tsx|jsx|mjs)$/.test(p)) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(d));
const offenders = [];

for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    // Skip comments — both `//` line comments and `*`-prefixed inside `/* */`.
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    if (line.includes(WRONG_URL) && !line.includes("eslint-disable") && !line.includes("cross-store-url-leak:ignore")) {
      offenders.push({
        file: f.replace(cwd + "/", ""),
        lineNum: i + 1,
        line: trimmed,
      });
    }
  }
}

if (offenders.length > 0) {
  console.error(`[check-cross-store-url-leak] FAIL — ${offenders.length} hit(s) of "${WRONG_URL}" in Sea code.`);
  console.error(`  Memory pin: feedback_cross_store_url_leak_pattern`);
  console.error(``);
  console.error(`  Sea code MUST NOT reference Wen's inv URL. Fix path:`);
  console.error(`    inventoryapp-ivory.vercel.app → seattle-cannabis-co.vercel.app`);
  console.error(``);
  console.error(`  Pre-fix (2026-05-04 forking incident): every Seattle applicant`);
  console.error(`  landed in Wen's hiring pipeline; vendors landed in Wen's vendor DB.`);
  console.error(`  Silent cross-store data leak — POSTs succeeded into the wrong DB.`);
  console.error(``);
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.lineNum}`);
    console.error(`    ${o.line}`);
  }
  console.error(``);
  console.error(`  Bypass (rare): append // cross-store-url-leak:ignore to the line.`);
  process.exit(1);
}

console.log(`✓ check-cross-store-url-leak: ${files.length} files scanned, 0 "${WRONG_URL}" references in Sea code (memory pin feedback_cross_store_url_leak_pattern pinned)`);
