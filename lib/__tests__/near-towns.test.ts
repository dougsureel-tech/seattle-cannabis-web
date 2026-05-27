// Tests for NEAR_TOWNS service-area data + getTown helper.
//
// Each NEAR_TOWNS row drives a /near/<slug> landing page (auto-pulled
// into sitemap.ts). Silent drift here can:
//   - Break SEO: missing slug or wrong canonical name
//   - Misroute customers: stale driveMins / transit info on prod
//   - Violate brand voice: generic SEO filler instead of hyperlocal
//     real-resident framing
//
// Structural pins (catch silent edits the brand-voice arc-guards can't):

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { NEAR_TOWNS, getTown } from "../near-towns.ts";

describe("NEAR_TOWNS — structural invariants", () => {
  test("non-empty array", () => {
    assert.ok(NEAR_TOWNS.length > 0, "should have at least one area");
  });

  test("every entry has required fields, no empty strings", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(t.slug, `${t.name ?? "?"} missing slug`);
      assert.ok(t.name, `${t.slug} missing name`);
      assert.ok(typeof t.driveMins === "number", `${t.slug} driveMins not a number`);
      assert.ok(t.driveMins >= 0, `${t.slug} driveMins negative`);
      assert.ok(t.transit, `${t.slug} missing transit`);
      assert.ok(t.pitch, `${t.slug} missing pitch`);
      assert.ok(t.whyStop, `${t.slug} missing whyStop`);
      assert.ok(Array.isArray(t.notableNeighbors), `${t.slug} notableNeighbors not array`);
    }
  });

  test("slugs are unique", () => {
    const slugs = NEAR_TOWNS.map((t) => t.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  });

  test("slugs are URL-safe (lowercase alphanumeric + hyphens)", () => {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const t of NEAR_TOWNS) {
      assert.match(t.slug, re, `${t.slug} not URL-safe`);
    }
  });

  test("driveMins is plausible (0-120 range for a service-area shop)", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(
        t.driveMins >= 0 && t.driveMins <= 120,
        `${t.slug} driveMins=${t.driveMins} outside 0-120 plausible range`,
      );
    }
  });

  test("pitch is a single sentence under 200 chars (SERP-fit)", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(
        t.pitch.length <= 200,
        `${t.slug} pitch over 200 chars (${t.pitch.length})`,
      );
    }
  });

  test("whyStop is substantive (>=80 chars to avoid SEO-thin-content)", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(
        t.whyStop.length >= 80,
        `${t.slug} whyStop too short (${t.whyStop.length} chars) — risks SEO thin-content penalty`,
      );
    }
  });
});

describe("NEAR_TOWNS — brand-voice compliance", () => {
  test("no whyStop body contains 'locally owned' framing (Doug 2026-05-02 directive)", () => {
    const re = /\blocally[\s-]owned\b/i;
    for (const t of NEAR_TOWNS) {
      assert.ok(!re.test(t.whyStop), `${t.slug} whyStop has 'locally owned' framing`);
      assert.ok(!re.test(t.pitch), `${t.slug} pitch has 'locally owned' framing`);
    }
  });

  test("no body says 'Senior discount' (Wisdom rename — Doug 2026-05 dignity)", () => {
    const re = /\bSenior\s+discount\b/i;
    for (const t of NEAR_TOWNS) {
      assert.ok(!re.test(t.whyStop), `${t.slug} whyStop uses 'Senior discount' (should be 'Wisdom')`);
      assert.ok(!re.test(t.pitch), `${t.slug} pitch uses 'Senior discount'`);
    }
  });
});

describe("getTown helper", () => {
  test("returns the matching area for a valid slug", () => {
    const first = NEAR_TOWNS[0];
    assert.ok(first);
    const got = getTown(first.slug);
    assert.ok(got);
    assert.equal(got.slug, first.slug);
    assert.equal(got.name, first.name);
  });

  test("returns null for unknown slug", () => {
    assert.equal(getTown("not-a-real-slug-12345"), null);
  });

  test("returns null for empty string", () => {
    assert.equal(getTown(""), null);
  });

  test("case-sensitive (uppercase slug not matched)", () => {
    const first = NEAR_TOWNS[0];
    assert.ok(first);
    assert.equal(
      getTown(first.slug.toUpperCase()),
      null,
      "getTown is case-sensitive by design (URL slugs are lowercase)",
    );
  });
});

describe("NEAR_TOWNS — Tier-1 growth coverage (Doug-directive 2026-05-27)", () => {
  // Local-SEO expert recommended these three 5-min-drive-time
  // neighborhoods as the highest-leverage organic-search targets
  // (vs. the wrong-direction Bellevue/Kirkland trade-area pages).
  // Pin them so a corpus refactor doesn't silently drop one — they
  // ALL must keep shipping with cityCopy for the substantive-body
  // tier per Generative-SEO expert's "thin-content" flag.
  test("columbia-city, beacon-hill, mt-baker all present", () => {
    const slugs = new Set(NEAR_TOWNS.map((t) => t.slug));
    assert.ok(slugs.has("columbia-city"), "columbia-city is Tier-1 (5-min drive, light rail)");
    assert.ok(slugs.has("beacon-hill"), "beacon-hill is Tier-1 (transit corridor)");
    assert.ok(slugs.has("mt-baker"), "mt-baker is Tier-1 (light rail)");
  });

  test("Tier-1 neighborhoods all have substantive cityCopy (>=400 chars)", () => {
    // Generative-search expert: "the existing /visit/from-* pages are
    // 'thin' (only LocalBusiness + Breadcrumb + Article schema, no FAQ).
    // Make the /near/<area> pages substantive: 400+ words body." This
    // pin enforces the body-depth floor for the three Tier-1 picks so
    // a future edit doesn't silently regress one to whyStop-only.
    const tier1 = ["columbia-city", "beacon-hill", "mt-baker"];
    for (const slug of tier1) {
      const t = getTown(slug);
      assert.ok(t, `${slug} should exist in NEAR_TOWNS`);
      assert.ok(t.cityCopy, `${slug} should have cityCopy for substantive-body tier`);
      assert.ok(
        t.cityCopy.length >= 400,
        `${slug} cityCopy is only ${t.cityCopy?.length ?? 0} chars — Tier-1 floor is 400+`,
      );
    }
  });
});
