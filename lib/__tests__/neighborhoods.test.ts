// Tests for NEIGHBORHOODS + helpers.
//
// Drives the homepage interactive map (components/NeighborhoodMap.tsx) +
// deal-of-the-day surface. Pins:
//   - SVG coordinate sanity (0-100 normalized)
//   - SHOP_PIN at canonical (50, 56) per file header comment
//   - id slugs URL-safe (used as data-attr + storage key)
//   - directionsUrl builds correct Google Maps URL
//   - neighborhoodById helper

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  NEIGHBORHOODS,
  SHOP_PIN,
  neighborhoodById,
  directionsUrl,
  type Neighborhood,
} from "../neighborhoods.ts";

describe("NEIGHBORHOODS — structural invariants", () => {
  test("non-empty array", () => {
    assert.ok(NEIGHBORHOODS.length > 0);
  });

  test("every neighborhood has all required fields", () => {
    for (const n of NEIGHBORHOODS) {
      assert.ok(n.id, `${n.name ?? "?"} missing id`);
      assert.ok(n.name, `${n.id} missing name`);
      assert.ok(n.pos, `${n.id} missing pos`);
      assert.equal(typeof n.pos.x, "number", `${n.id} pos.x not number`);
      assert.equal(typeof n.pos.y, "number", `${n.id} pos.y not number`);
      assert.equal(typeof n.driveMin, "number", `${n.id} driveMin not number`);
      assert.ok(n.transit, `${n.id} missing transit`);
      assert.ok(n.blurb, `${n.id} missing blurb`);
      assert.ok(n.mapsOrigin, `${n.id} missing mapsOrigin`);
    }
  });

  test("ids are unique", () => {
    const ids = NEIGHBORHOODS.map((n) => n.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate id");
  });

  test("ids are kebab-case URL-safe", () => {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const n of NEIGHBORHOODS) {
      assert.match(n.id, re, `${n.id} not kebab-case`);
    }
  });

  test("pos coordinates are within 0-100 SVG viewBox", () => {
    for (const n of NEIGHBORHOODS) {
      assert.ok(n.pos.x >= 0 && n.pos.x <= 100, `${n.id} pos.x=${n.pos.x} outside 0-100`);
      assert.ok(n.pos.y >= 0 && n.pos.y <= 100, `${n.id} pos.y=${n.pos.y} outside 0-100`);
    }
  });

  test("driveMin is plausible (0-60 minutes within South Seattle)", () => {
    for (const n of NEIGHBORHOODS) {
      assert.ok(
        n.driveMin >= 0 && n.driveMin <= 60,
        `${n.id} driveMin=${n.driveMin} implausible for South Seattle`,
      );
    }
  });

  test("walkMin is either null or a non-negative number", () => {
    for (const n of NEIGHBORHOODS) {
      if (n.walkMin !== null) {
        assert.equal(typeof n.walkMin, "number");
        assert.ok(n.walkMin >= 0, `${n.id} walkMin negative`);
      }
    }
  });

  test("blurb is concise (under 200 chars)", () => {
    for (const n of NEIGHBORHOODS) {
      assert.ok(
        n.blurb.length <= 200,
        `${n.id} blurb over 200 chars (${n.blurb.length})`,
      );
    }
  });
});

describe("SHOP_PIN — canonical anchor", () => {
  test("sits at (50, 56) per file header comment", () => {
    assert.equal(SHOP_PIN.x, 50);
    assert.equal(SHOP_PIN.y, 56);
  });
});

describe("neighborhoodById helper", () => {
  test("returns matching neighborhood for valid id", () => {
    const first = NEIGHBORHOODS[0];
    assert.ok(first);
    const got = neighborhoodById(first.id);
    assert.ok(got);
    assert.equal(got.id, first.id);
  });

  test("returns undefined for unknown id", () => {
    assert.equal(neighborhoodById("not-a-real-id"), undefined);
  });

  test("returns undefined for empty string", () => {
    assert.equal(neighborhoodById(""), undefined);
  });
});

describe("directionsUrl helper", () => {
  test("builds correct Google Maps directions URL", () => {
    const fake: Neighborhood = {
      id: "test",
      name: "Test",
      pos: { x: 0, y: 0 },
      driveMin: 0,
      walkMin: null,
      transit: "—",
      blurb: "—",
      mapsOrigin: "Othello Station, Seattle WA",
    };
    const url = directionsUrl(fake, "7266 Rainier Ave S, Seattle WA");
    assert.ok(
      url.startsWith("https://www.google.com/maps/dir/?api=1&"),
      `URL prefix wrong: ${url}`,
    );
    assert.ok(url.includes("origin=Othello%20Station"));
    assert.ok(url.includes("destination=7266%20Rainier"));
  });

  test("URL-encodes origin + destination correctly", () => {
    const fake: Neighborhood = {
      id: "test",
      name: "Test",
      pos: { x: 0, y: 0 },
      driveMin: 0,
      walkMin: null,
      transit: "—",
      blurb: "—",
      mapsOrigin: "café & deli",
    };
    const url = directionsUrl(fake, "shop");
    // & must be encoded; café's special character must be encoded
    assert.ok(!url.includes("&deli"), "& in origin should be encoded");
    assert.ok(url.includes("caf%C3%A9") || url.includes("caf%E9"), "non-ASCII should be encoded");
  });
});
