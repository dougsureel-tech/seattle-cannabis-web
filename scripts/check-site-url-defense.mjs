/**
 * SITE_URL/SITE_ORIGIN vercel.app-defense gate.
 *
 * Pins the v8.375 (welcome-email) → v8.415 (quiz-nurture + rewards/sign-out)
 * vercel.app-defense pattern against regression. Fails when any file under
 * `app/` or `lib/` (excluding the SSoT-aware files) inlines:
 *
 *   process.env.NEXT_PUBLIC_SITE_URL || "<canonical>"
 *   process.env.NEXT_PUBLIC_SITE_ORIGIN || "<canonical>"
 *
 * Without the `.includes(".vercel.app")` rejection layer that the welcome-
 * email / quiz-nurture / rewards-sign-out pattern uses. Sister of the GW
 * v2.82.80 build-gate pattern (lib/app-url.ts CANONICAL_APP_URL SSoT).
 *
 * Why: customer email surfaces (welcome, quiz-nurture, rewards) carry
 * deep-links built from these env vars. If env drifts to *.vercel.app
 * preview hostname, customer links land on wrong host. The defense
 * pattern lives in 3 spots already; this gate prevents future agents
 * from re-introducing the inline `||` pattern that bypasses defense.
 *
 * Allowlist: files that already implement the defense pattern
 * (`env && !env.includes(".vercel.app") ? env : "<canonical>"`).
 *
 * Usage: `pnpm check:site-url-defense` (manual run); could wire into
 * pre-push hook if scc/glw grow one.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

// Files that read the env var DIRECTLY but use the defense pattern
// (`env && !env.includes(".vercel.app") ? env : "<canonical>"`). Each
// has the IIFE / defensive shape and is the canonical place to read.
const EXEMPT = new Set([
  "lib/welcome-email.ts",
  "lib/quiz-nurture-email.ts",
  "app/api/rewards/sign-out/route.ts",
  "lib/version.ts",          // build-version SHA + version pin (no canonical pollution risk)
]);

const PATTERN_SITE_URL = /process\.env\.NEXT_PUBLIC_SITE_URL\s*\|\|\s*["'`]/;
const PATTERN_SITE_ORIGIN = /process\.env\.NEXT_PUBLIC_SITE_ORIGIN\s*\|\|\s*["'`]/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "scripts") continue;
      out.push(...walk(p));
    } else if (s.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
      out.push(p);
    }
  }
  return out;
}

const SCAN_DIRS = ["app", "lib", "components"]
  .map((d) => join(ROOT, d))
  .filter((p) => {
    try {
      return statSync(p).isDirectory();
    } catch {
      return false;
    }
  });

const offenders = [];
const allFiles = SCAN_DIRS.flatMap(walk);
for (const file of allFiles) {
  const rel = relative(ROOT, file);
  if (EXEMPT.has(rel)) continue;
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (PATTERN_SITE_URL.test(lines[i]) || PATTERN_SITE_ORIGIN.test(lines[i])) {
      offenders.push({ file: rel, line: i + 1, text: lines[i].trim().slice(0, 140) });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-site-url-defense: 0 offenders across ${allFiles.length} files`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-site-url-defense (warn)" : "✗ check-site-url-defense";
console.error(`\n${header}: ${offenders.length} inline NEXT_PUBLIC_SITE_URL/SITE_ORIGIN fallback(s) found\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.text}`);
}
console.error("\nWhy: inline `process.env.NEXT_PUBLIC_SITE_URL || \"<canonical>\"` lacks");
console.error("the `.includes(\".vercel.app\")` rejection. If env ever drifts to a vercel.app");
console.error("preview hostname, customer email/SMS deep-links land on the wrong host. Use the");
console.error("defensive pattern from `lib/welcome-email.ts`:");
console.error("  const env = process.env.NEXT_PUBLIC_SITE_URL;");
console.error("  const base = env && !env.includes(\".vercel.app\") ? env : \"https://seattlecannabis.co\";");
console.error("Sister of inv v303.605/v305.005/v305.805 + GW v2.82.80 cross-repo arc.\n");
process.exit(WARN_ONLY ? 0 : 1);
