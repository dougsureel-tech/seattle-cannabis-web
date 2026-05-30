// Pure helpers for the /menu/preview/[id] PDP surface. Phase 0 of the
// Product UX Redesign (PLAN_PRODUCT_UX_REDESIGN_2026_05_30.md): a read-only
// preview surface to validate the Curaleaf-hierarchy PDP design in front of
// real customers before committing to the cart + checkout cutover.
//
// Sister-port: `greenlife-web/lib/pdp-helpers.ts` is identical EXCEPT the
// out-the-door tax multiplier (Seattle 10.55% sales tax → 1.4755 vs Wen
// 8.8% → 1.458). The rest is pure-function + pure-data and matches
// byte-for-byte.

import { DAY_MS } from "./time-constants.ts";
import { round2 } from "./money-math.ts";

/** Effect-chip keyword library. See greenlife-web/lib/pdp-helpers.ts for
 *  the full rubric — preference-context only per WAC 314-55-155, never
 *  efficacy claims. Customer sees max 3 chips per PDP. */
export const EFFECT_CHIP_LIBRARY: Array<{ label: string; keywords: string[] }> = [
  { label: "Relaxing", keywords: ["relax", "chill", "mellow", "calm", "unwind", "nightcap"] },
  { label: "Energizing", keywords: ["energ", "uplift", "uplifting", "wake", "morning"] },
  { label: "Creative", keywords: ["creative", "creativity", "focus-creative", "studio"] },
  { label: "Focus", keywords: ["focus", "focused", "clear-head", "productive"] },
  { label: "Sleep", keywords: ["sleep", "bedtime", "couch-lock", "sedat"] },
  { label: "Social", keywords: ["social", "party", "talkative", "conversation"] },
];

/** Extract up to `max` effect chips from a product's notes + effects
 *  field via case-insensitive substring match against the chip library.
 *  Returns chips in library order (priority desc); duplicates de-duped.
 *  Returns [] for null/empty input. */
export function extractEffectChips(
  notes: string | null | undefined,
  effects: string | null | undefined,
  max = 3,
): string[] {
  const haystack = `${notes ?? ""} ${effects ?? ""}`.toLowerCase();
  if (!haystack.trim()) return [];
  const hits: string[] = [];
  for (const entry of EFFECT_CHIP_LIBRARY) {
    if (hits.length >= max) break;
    if (entry.keywords.some((kw) => haystack.includes(kw.toLowerCase()))) {
      hits.push(entry.label);
    }
  }
  return hits;
}

/** WA cannabis tax multiplier — 37% retail excise + ~10.55% local sales
 *  tax for Seattle. PDP "Out the door: $X" preview multiplies the line
 *  price by this divisor per the UX brief (PLAN_PRODUCT_UX_REDESIGN
 *  §3 + §5). See greenlife-web/lib/pdp-helpers.ts header for the
 *  tax-inclusive convention note — the preview math follows the brief
 *  explicitly. */
export const SEA_OUT_THE_DOOR_MULTIPLIER = 1.4755;

/** Multiply a posted price by the out-the-door multiplier. Rounds to the
 *  nearest cent. Null in → null out. */
export function outTheDoorPrice(
  posted: number | null | undefined,
  multiplier: number,
): number | null {
  if (posted == null || !Number.isFinite(posted)) return null;
  return round2(posted * multiplier);
}

/** Decide whether to render the brand-fallback "ProductImage" specimen
 *  card OR the real vendor image. */
export function shouldUseImageFallback(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true;
  if (typeof imageUrl !== "string") return true;
  return imageUrl.trim().length === 0;
}

/** Reviews aggregate math — see greenlife-web sister for full rationale. */
export function reviewsAggregate(
  reviews: Array<{ rating: number }>,
): { avgScore: number | null; count: number } {
  if (!reviews || reviews.length === 0) return { avgScore: null, count: 0 };
  const valid = reviews.filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  if (valid.length === 0) return { avgScore: null, count: 0 };
  const sum = valid.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / valid.length;
  return { avgScore: Math.round(avg * 10) / 10, count: valid.length };
}

/** Format a reviewed-N-weeks-ago label. */
export function formatReviewAge(
  createdAt: string | Date,
  now: number = Date.now(),
): string {
  const t =
    createdAt instanceof Date
      ? createdAt.getTime()
      : new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return "recently";
  const ageMs = now - t;
  if (ageMs < 0) return "just now";
  const ageDays = Math.floor(ageMs / DAY_MS);
  if (ageDays === 0) return "today";
  if (ageDays === 1) return "yesterday";
  if (ageDays < 14) return `${ageDays} days ago`;
  const ageWeeks = Math.floor(ageDays / 7);
  if (ageWeeks < 9) return `${ageWeeks} weeks ago`;
  const ageMonths = Math.floor(ageDays / 30);
  if (ageMonths < 13) return `${ageMonths} months ago`;
  return "over a year ago";
}

/** Derive a "Since YYYY" tenure label from customer enrollment timestamp. */
export function customerTenureLabel(createdAt: string | Date | null | undefined): string {
  if (!createdAt) return "Anonymous";
  const t =
    createdAt instanceof Date
      ? createdAt
      : new Date(createdAt);
  const year = t.getFullYear();
  if (!Number.isFinite(year) || year < 2000 || year > 9999) return "Anonymous";
  return `Customer since ${year}`;
}
