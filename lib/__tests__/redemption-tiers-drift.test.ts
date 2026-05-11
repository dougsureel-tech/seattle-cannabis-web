// Tests that the TWO REDEMPTION_TIERS arrays in this repo describe the
// SAME tiers semantically. Drift detection between:
//   - lib/loyalty-redemption.ts (read by app/order/OrderMenu.tsx — dead
//     code post-proxy-redirect, but the file remains)
//   - lib/redemption-tiers.ts (read by app/rewards/redeem/page.tsx — LIVE
//     customer-facing PWA, Track B SpringBig replacement)
//
// Why pinned: both files declare themselves as mirrors of the inv SoT.
// When Doug changes a tier (e.g. adds 500-pt at 35%, or shifts the $75
// cliff to $100), he updates ONE file. The OTHER silently drifts. The
// /rewards customers see one set of tiers; the legacy /order page (if a
// crawler ever hits the dead route before the proxy redirect) would
// emit the other in JSON-LD / structured data.
//
// This test enforces the invariant: same 6 tiers, same costs, same
// discount %, same $75 cliff semantics. Field shape differs across the
// two files (loyalty-redemption omits when N/A; redemption-tiers uses
// explicit `null`) — the test normalizes both to compare semantically.
//
// Long-term cleanup: drop lib/loyalty-redemption.ts entirely when
// app/order/ is deleted. Track B cutover (6/25) is the natural moment.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { REDEMPTION_TIERS as TIERS_OLD } from "../loyalty-redemption.ts";
import { REDEMPTION_TIERS as TIERS_NEW } from "../redemption-tiers.ts";

// Normalize a tier from either file to the same shape — treat missing
// max/min as `null` for comparison.
function normalize(t: { pointCost: number; discountPct: number; label: string; maxOrderSubtotal?: number | null; minOrderSubtotal?: number | null }) {
  return {
    pointCost: t.pointCost,
    discountPct: t.discountPct,
    label: t.label,
    maxOrderSubtotal: t.maxOrderSubtotal ?? null,
    minOrderSubtotal: t.minOrderSubtotal ?? null,
  };
}

describe("REDEMPTION_TIERS drift between loyalty-redemption.ts and redemption-tiers.ts", () => {
  test("both arrays have the same length", () => {
    assert.equal(TIERS_OLD.length, TIERS_NEW.length, `length drift: old=${TIERS_OLD.length} new=${TIERS_NEW.length}`);
  });

  test("each tier matches semantically across the two files", () => {
    for (let i = 0; i < TIERS_OLD.length; i += 1) {
      const a = normalize(TIERS_OLD[i]!);
      const b = normalize(TIERS_NEW[i]!);
      assert.deepEqual(a, b, `tier #${i + 1} drift: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    }
  });

  test("point costs match Doug's 50/100/200/250/300/400 cliff in both files", () => {
    const expected = [50, 100, 200, 250, 300, 400];
    assert.deepEqual(TIERS_OLD.map((t) => t.pointCost), expected);
    assert.deepEqual(TIERS_NEW.map((t) => t.pointCost), expected);
  });

  test("the $75 cliff stays in both files: 300-pt strict-less-than, 400-pt inclusive", () => {
    // Both files must agree on the boundary semantics that decide which
    // 30%-tier the register applies. Silent drift here = customer-facing
    // discount-math bug.
    const old300 = TIERS_OLD.find((t) => t.pointCost === 300)!;
    const new300 = TIERS_NEW.find((t) => t.pointCost === 300)!;
    assert.equal(old300.maxOrderSubtotal ?? null, 75);
    assert.equal(new300.maxOrderSubtotal ?? null, 75);

    const old400 = TIERS_OLD.find((t) => t.pointCost === 400)!;
    const new400 = TIERS_NEW.find((t) => t.pointCost === 400)!;
    assert.equal(old400.minOrderSubtotal ?? null, 75);
    assert.equal(new400.minOrderSubtotal ?? null, 75);
  });
});
