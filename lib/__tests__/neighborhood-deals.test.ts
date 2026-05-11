// Tests for NEIGHBORHOOD_DEALS map + dealForNeighborhood helper.
//
// Renders on the homepage interactive map popover. Per file-header rules:
//   - Chip text under ~24 chars
//   - No exclamation marks, no "WHILE SUPPLIES LAST" yelling
//   - No compliance disclaimer copy
//
// Plus: every neighborhood in NEIGHBORHOODS must have a key in this map
// (even if null = use global fallback). Caught silently before:
// adding a new neighborhood to NEIGHBORHOODS without adding a key here
// produced an undefined deal at runtime.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { NEIGHBORHOOD_DEALS, dealForNeighborhood } from "../neighborhood-deals.ts";
import { NEIGHBORHOODS } from "../neighborhoods.ts";

describe("NEIGHBORHOOD_DEALS — structural invariants", () => {
  test("every NEIGHBORHOODS id has a key in NEIGHBORHOOD_DEALS", () => {
    for (const n of NEIGHBORHOODS) {
      assert.ok(
        n.id in NEIGHBORHOOD_DEALS,
        `${n.id} missing from NEIGHBORHOOD_DEALS — silent runtime undefined`,
      );
    }
  });

  test("every non-null deal has short + detail strings", () => {
    for (const [id, deal] of Object.entries(NEIGHBORHOOD_DEALS)) {
      if (deal === null) continue;
      assert.ok(deal.short, `${id} missing short`);
      assert.ok(deal.detail, `${id} missing detail`);
    }
  });
});

describe("NEIGHBORHOOD_DEALS — editorial discipline (file-header rules)", () => {
  test("short chip text stays under 32 chars (header says ~24)", () => {
    for (const [id, deal] of Object.entries(NEIGHBORHOOD_DEALS)) {
      if (deal === null) continue;
      assert.ok(
        deal.short.length <= 32,
        `${id} short over 32 chars (${deal.short.length}): "${deal.short}"`,
      );
    }
  });

  test("no exclamation marks in short or detail", () => {
    for (const [id, deal] of Object.entries(NEIGHBORHOOD_DEALS)) {
      if (deal === null) continue;
      assert.ok(!deal.short.includes("!"), `${id} short has exclamation: "${deal.short}"`);
      assert.ok(!deal.detail.includes("!"), `${id} detail has exclamation: "${deal.detail}"`);
    }
  });

  test('no "WHILE SUPPLIES LAST" yelling (any all-caps phrase ≥3 words)', () => {
    for (const [id, deal] of Object.entries(NEIGHBORHOOD_DEALS)) {
      if (deal === null) continue;
      // 3+ consecutive uppercase words (allow short acronyms like "AIO" / "ZIP")
      const yellingRe = /\b[A-Z]{4,}\s+[A-Z]{4,}\s+[A-Z]{4,}/;
      assert.ok(!yellingRe.test(deal.short), `${id} short yells`);
      assert.ok(!yellingRe.test(deal.detail), `${id} detail yells`);
    }
  });
});

describe("NEIGHBORHOOD_DEALS — brand-voice compliance", () => {
  test("no deal contains 'Senior discount' (Wisdom rename)", () => {
    const re = /\bSenior\s+discount\b/i;
    for (const [id, deal] of Object.entries(NEIGHBORHOOD_DEALS)) {
      if (deal === null) continue;
      assert.ok(!re.test(deal.short), `${id} uses 'Senior discount'`);
      assert.ok(!re.test(deal.detail), `${id} uses 'Senior discount'`);
    }
  });

  test("no deal contains 'locally owned' framing", () => {
    const re = /\blocally[\s-]owned\b/i;
    for (const [id, deal] of Object.entries(NEIGHBORHOOD_DEALS)) {
      if (deal === null) continue;
      assert.ok(!re.test(deal.short), `${id} uses 'locally owned'`);
      assert.ok(!re.test(deal.detail), `${id} uses 'locally owned'`);
    }
  });
});

describe("dealForNeighborhood helper", () => {
  test("returns the deal for a valid neighborhood id with non-null deal", () => {
    const result = dealForNeighborhood("rainier-valley");
    assert.ok(result);
    assert.ok(result.short);
    assert.ok(result.detail);
  });

  test("returns null for a neighborhood explicitly set to null (othello)", () => {
    assert.equal(dealForNeighborhood("othello"), null);
  });

  test("returns null for unknown neighborhood id", () => {
    assert.equal(dealForNeighborhood("not-a-real-neighborhood"), null);
  });

  test("returns null for empty string", () => {
    assert.equal(dealForNeighborhood(""), null);
  });
});
