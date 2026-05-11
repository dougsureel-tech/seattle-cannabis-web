// Locks lib/redemption-tiers.ts against the CANONICAL loyalty ladder
// per `docs/brand-voice.md` (Doug 2026-05-07 spec) +
// `PLAN_LOYALTY_REDEMPTION_TIERS.md`.
//
// The existing `redemption-tiers-drift.test.ts` checks the two
// REDEMPTION_TIERS arrays (loyalty-redemption.ts + redemption-tiers.ts)
// agree with each other. That catches accidental one-sided edits.
//
// What it does NOT catch: SYMMETRIC drift — e.g., if someone updates
// BOTH files to change "5% off" → "5% discount" or shifts 250pt → 275pt
// in both, the drift test passes (consistency intact) but the
// brand-voice / Doug-spec canon is violated.
//
// This test locks the absolute values from the canon. If Doug ever
// genuinely changes the tier ladder, this test fails and forces a
// deliberate update (+ matching brand-voice doc + PLAN doc edit).

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { REDEMPTION_TIERS } from "../redemption-tiers.ts";

describe("REDEMPTION_TIERS canonical-lock (Doug 2026-05-07 spec)", () => {
  test("exactly 6 tiers", () => {
    assert.equal(REDEMPTION_TIERS.length, 6);
  });

  test("point costs match the canonical 50/100/200/250/300/400 ladder", () => {
    assert.deepEqual(
      REDEMPTION_TIERS.map((t) => t.pointCost),
      [50, 100, 200, 250, 300, 400],
    );
  });

  test("discount percentages match the canonical 5/10/20/25/30/30 ladder", () => {
    assert.deepEqual(
      REDEMPTION_TIERS.map((t) => t.discountPct),
      [0.05, 0.1, 0.2, 0.25, 0.3, 0.3],
    );
  });

  test("labels match the canonical customer-facing strings", () => {
    assert.deepEqual(
      REDEMPTION_TIERS.map((t) => t.label),
      ["5% off", "10% off", "20% off", "25% off", "30% off (under $75)", "30% off ($75+)"],
    );
  });

  test("$75 basket cliff: 300pt strict-less-than, 400pt inclusive", () => {
    const t300 = REDEMPTION_TIERS.find((t) => t.pointCost === 300);
    const t400 = REDEMPTION_TIERS.find((t) => t.pointCost === 400);
    assert.ok(t300, "expected 300pt tier to exist");
    assert.ok(t400, "expected 400pt tier to exist");
    assert.equal(t300.maxOrderSubtotal, 75, "300pt should cap at < $75 basket");
    assert.equal(t300.minOrderSubtotal, null, "300pt should have no floor");
    assert.equal(t400.minOrderSubtotal, 75, "400pt should require ≥ $75 basket");
    assert.equal(t400.maxOrderSubtotal, null, "400pt should have no cap");
  });

  test("non-cliff tiers (50/100/200/250) have neither cap nor floor", () => {
    for (const pts of [50, 100, 200, 250]) {
      const t = REDEMPTION_TIERS.find((x) => x.pointCost === pts);
      assert.ok(t, `expected ${pts}pt tier to exist`);
      assert.equal(t.maxOrderSubtotal, null, `${pts}pt should have no cap`);
      assert.equal(t.minOrderSubtotal, null, `${pts}pt should have no floor`);
    }
  });

  test("tier sequence: pointCost is strictly ascending", () => {
    for (let i = 1; i < REDEMPTION_TIERS.length; i += 1) {
      assert.ok(
        REDEMPTION_TIERS[i].pointCost > REDEMPTION_TIERS[i - 1].pointCost,
        `tier ${i} pointCost should be > tier ${i - 1} pointCost`,
      );
    }
  });

  test("highest tier discount is 30% (no higher tier shipped per Doug 2026-05-07)", () => {
    const maxPct = Math.max(...REDEMPTION_TIERS.map((t) => t.discountPct));
    assert.equal(maxPct, 0.3, "30% is the cap per Doug spec; higher tiers not yet shipped");
  });
});
