// Tests for TEAM roster + initialOf helper. Drives the /our-community
// page on scc.
//
// Why pin:
//   - Doug 2026-05-07 removed himself from the public-facing team
//     ("take us off the website for now"). Without a guard, a casual
//     resort-of-good-intentions ("oh let's add Doug back, he's the owner")
//     would silently re-surface him.
//   - Kat is the current public-facing top-of-org. If a future edit removes
//     her without a designated replacement, /our-community renders an empty
//     "current" section.
//   - initialOf is rendered as the avatar fallback when photoSrc is null —
//     which is currently every single row. A regression to ".charAt(0)"
//     would break the multi-word handling (e.g. "Jensine San" should
//     render "JS", not just "J").

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { TEAM, CURRENT_TEAM, ALUMNI_TEAM, initialOf } from "../team.ts";

describe("TEAM — structural invariants", () => {
  test("at least one team member", () => {
    assert.ok(TEAM.length > 0);
  });

  test("every member has required fields with correct types", () => {
    const validEras = new Set(["current", "alumni"]);
    for (const m of TEAM) {
      assert.equal(typeof m.name, "string");
      assert.ok(m.name.length > 0, `team row missing name`);
      assert.equal(typeof m.role, "string");
      assert.ok(m.role.length > 0, `${m.name} missing role`);
      assert.ok(validEras.has(m.era), `${m.name} invalid era "${m.era}"`);
      assert.ok(
        m.photoSrc === null || typeof m.photoSrc === "string",
        `${m.name} photoSrc must be null or string`,
      );
      assert.equal(typeof m.oneLine, "string");
    }
  });

  test("photoSrc strings (when set) resolve under /team/", () => {
    for (const m of TEAM) {
      if (m.photoSrc === null) continue;
      assert.match(
        m.photoSrc,
        /^\/team\//,
        `${m.name} photoSrc must start with /team/`,
      );
    }
  });
});

describe("TEAM — Doug-call 2026-05-07 (off-site)", () => {
  test("no team row for Doug", () => {
    for (const m of TEAM) {
      assert.ok(
        !/^doug\b/i.test(m.name),
        `Doug removed from public team 2026-05-07 — do not re-add without his greenlight`,
      );
    }
  });

  test("Kat carries the current public-facing top-of-org", () => {
    const kat = CURRENT_TEAM.find((m) => /^kat\b/i.test(m.name));
    assert.ok(kat, "Kat must remain on /our-community as GM (Doug 2026-05-07)");
    assert.match(kat.role, /general manager/i);
  });
});

describe("TEAM — partition helpers", () => {
  test("CURRENT_TEAM only contains era=current", () => {
    for (const m of CURRENT_TEAM) {
      assert.equal(m.era, "current");
    }
  });

  test("ALUMNI_TEAM only contains era=alumni", () => {
    for (const m of ALUMNI_TEAM) {
      assert.equal(m.era, "alumni");
    }
  });

  test("partition is exhaustive (CURRENT + ALUMNI = TEAM length)", () => {
    assert.equal(CURRENT_TEAM.length + ALUMNI_TEAM.length, TEAM.length);
  });

  test("CURRENT_TEAM is non-empty (public-facing page must render someone)", () => {
    assert.ok(
      CURRENT_TEAM.length > 0,
      "Empty current roster = blank /our-community current section",
    );
  });
});

describe("initialOf — avatar fallback", () => {
  test("two-word name returns first + last initial", () => {
    assert.equal(initialOf("Jensine San"), "JS");
    assert.equal(initialOf("Austin Aronson"), "AA");
  });

  test("three-word name uses first + LAST initial (skips middles)", () => {
    assert.equal(initialOf("Mary Jane Smith"), "MS");
  });

  test("single-word name returns first letter only", () => {
    assert.equal(initialOf("Kat"), "K");
    assert.equal(initialOf("Madonna"), "M");
  });

  test("output is always uppercase regardless of input casing", () => {
    assert.equal(initialOf("jensine san"), "JS");
    assert.equal(initialOf("kat"), "K");
  });

  test("collapses multiple internal spaces", () => {
    assert.equal(initialOf("Jensine    San"), "JS");
  });

  test("trims leading + trailing whitespace", () => {
    assert.equal(initialOf("  Kat  "), "K");
    assert.equal(initialOf(" Jensine San "), "JS");
  });

  test("empty string returns '?'", () => {
    assert.equal(initialOf(""), "?");
  });

  test("whitespace-only string returns '?'", () => {
    assert.equal(initialOf("   "), "?");
  });
});
