/**
 * Double-period SEO description gate.
 *
 * Pins the v21.905 sweep that fixed 11 SERP-visible descriptions which
 * rendered "Seattle Cannabis Co.." (double period) in browser SERPs +
 * Twitter/FB share cards + AI-search citations.
 *
 * Root cause: `STORE.name = "Seattle Cannabis Co."` already ends with the
 * abbreviation period; any `${STORE.name}.` interpolation produces "Co..".
 *
 * This guard scans `app/` + `lib/` + `components/` for template literal
 * patterns `${STORE.name}.` (and a few common-sister cases) and fails the
 * build if any are found. Drop the redundant `.` from the template — the
 * interpolation provides it.
 *
 * Glw side has STORE.name = "Green Life Cannabis" (no trailing period) so
 * `${STORE.name}.` is CORRECT on glw and this guard does NOT need to run
 * there (won't, because this script only lives on scc).
 *
 * Run via:
 *   node scripts/check-store-name-double-period.mjs           # strict
 *   node scripts/check-store-name-double-period.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "lib", "components"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const EXEMPT_FILES = new Set([
  // version.ts entries reference the pattern by NAME in changelog
  // comments — they're not live code paths.
  "lib/version.ts",
  // This script lives in scripts/ which isn't scanned, but if the guard
  // gets moved, exempt itself.
  "scripts/check-store-name-double-period.mjs",
]);

// Match `${STORE.name}.` where the `.` is template-literal text (not a
// JS expression like `${STORE.name}.foo` which is property access). We
// detect that by requiring whitespace, `}` end-of-string, or specific
// punctuation immediately after the `.`.
const PATTERN = /\$\{STORE\.name\}\.(?:\s|`|"|'|$)/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "__tests__") continue;
      out.push(...walk(p));
    } else if (s.isFile()) {
      const dot = p.lastIndexOf(".");
      if (dot >= 0 && EXTENSIONS.has(p.slice(dot))) out.push(p);
    }
  }
  return out;
}

const offenders = [];
for (const d of SCAN_DIRS) {
  const dirPath = join(ROOT, d);
  try {
    if (!statSync(dirPath).isDirectory()) continue;
  } catch {
    continue;
  }
  for (const file of walk(dirPath)) {
    const rel = relative(ROOT, file);
    if (EXEMPT_FILES.has(rel)) continue;
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (PATTERN.test(lines[i])) {
        offenders.push({ file: rel, line: i + 1, text: lines[i].trim().slice(0, 120) });
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-store-name-double-period: 0 offenders (STORE.name already ends with "." — templates must not add another)`,
  );
  process.exit(0);
}

const header = WARN_ONLY
  ? "⚠️  check-store-name-double-period (warn)"
  : "✗ check-store-name-double-period";
console.error(`${header}: ${offenders.length} offender(s) found:`);
console.error("");
console.error("  STORE.name = 'Seattle Cannabis Co.' (ends with period). Templates");
console.error("  using `${STORE.name}.` produce 'Co..' in customer-facing SERP +");
console.error("  share-card + AI-citation descriptions. Drop the redundant '.':");
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.text}`);
}
console.error("");
console.error("  Fix: replace `\\${STORE.name}.` with `\\${STORE.name}` — STORE.name");
console.error("  already provides the period from the abbreviation.");
console.error("");
process.exit(WARN_ONLY ? 0 : 1);
