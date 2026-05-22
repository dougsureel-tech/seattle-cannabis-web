// Pin tests for lib/product-placeholder.ts — SCC sister of the GLW pin.
// Same shape, INDIGO instead of EMERALD for Hybrid + DEFAULT + Capsules/
// Accessories (per-stack brand divergence is intentional; pinned per-stack
// because a sister-port mismatch would force one brand to wear the other's
// colors on the menu placeholder grid).

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  getProductPlaceholderGradient,
  getProductPlaceholderIcon,
  PRODUCT_CATEGORY_ICONS,
} from "../product-placeholder.ts";

describe("getProductPlaceholderGradient — strain-priority for Flower / Pre-Rolls", () => {
  test("Flower + Sativa → red-orange-amber strain gradient", () => {
    assert.equal(
      getProductPlaceholderGradient("Flower", "Sativa"),
      "bg-gradient-to-br from-red-100 via-orange-50 to-amber-100",
    );
  });
  test("Flower + Indica → purple-indigo-blue strain gradient", () => {
    assert.equal(
      getProductPlaceholderGradient("Flower", "Indica"),
      "bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100",
    );
  });
  test("Flower + Hybrid → INDIGO-violet-blue (SCC brand-tinted — DIVERGES from GLW emerald)", () => {
    assert.equal(
      getProductPlaceholderGradient("Flower", "Hybrid"),
      "bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-100",
    );
  });
  test("Flower + CBD → sky-blue-cyan strain gradient", () => {
    assert.equal(
      getProductPlaceholderGradient("Flower", "CBD"),
      "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100",
    );
  });
  test("Pre-Rolls + Sativa → strain gradient (Pre-Rolls also strain-priority)", () => {
    assert.equal(
      getProductPlaceholderGradient("Pre-Rolls", "Sativa"),
      "bg-gradient-to-br from-red-100 via-orange-50 to-amber-100",
    );
  });
  test("Pre-Roll (singular) + Indica → strain gradient (startsWith handles both)", () => {
    assert.equal(
      getProductPlaceholderGradient("Pre-Roll", "Indica"),
      "bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100",
    );
  });
  test("Flower + UNKNOWN strain → falls through to SCC DEFAULT (indigo)", () => {
    assert.equal(
      getProductPlaceholderGradient("Flower", "AlienStrain"),
      "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50",
    );
  });
  test("Flower + null strain → SCC DEFAULT", () => {
    assert.equal(
      getProductPlaceholderGradient("Flower", null),
      "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50",
    );
  });
});

describe("getProductPlaceholderGradient — category fallback for non-flower", () => {
  test("Edibles → amber-orange-yellow", () => {
    assert.equal(
      getProductPlaceholderGradient("Edibles", null),
      "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
    );
  });
  test("Edible (singular) → same gradient as Edibles", () => {
    assert.equal(
      getProductPlaceholderGradient("Edible", null),
      getProductPlaceholderGradient("Edibles", null),
    );
  });
  test("Vapes / Cartridge / Cartridges / Disposable / Disposables / Pod / Pods → SAME violet-purple-indigo (single vape gradient)", () => {
    const expected = "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100";
    for (const cat of ["Vapes", "Cartridge", "Cartridges", "Disposable", "Disposables", "Pod", "Pods"]) {
      assert.equal(getProductPlaceholderGradient(cat, null), expected, `${cat} should be vape-purple`);
    }
  });
  test("Concentrates / Concentrate → INDIGO-amber-orange (SCC warm-dab tint — DIVERGES from GLW emerald first-stop)", () => {
    assert.equal(
      getProductPlaceholderGradient("Concentrates", null),
      "bg-gradient-to-br from-indigo-50 via-amber-50 to-orange-100",
    );
    assert.equal(
      getProductPlaceholderGradient("Concentrate", null),
      "bg-gradient-to-br from-indigo-50 via-amber-50 to-orange-100",
    );
  });
  test("Beverages → cyan-sky-blue", () => {
    assert.equal(
      getProductPlaceholderGradient("Beverages", null),
      "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
    );
  });
  test("Tinctures → teal-cyan-sky", () => {
    assert.equal(
      getProductPlaceholderGradient("Tinctures", null),
      "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
    );
  });
  test("Topicals → rose-pink-fuchsia", () => {
    assert.equal(
      getProductPlaceholderGradient("Topicals", null),
      "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
    );
  });
  test("Capsules / Capsule / Accessories / Accessory → INDIGO-violet-blue (SCC brand-tinted — DIVERGES from GLW emerald)", () => {
    const expected = "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50";
    for (const cat of ["Capsules", "Capsule", "Accessories", "Accessory"]) {
      assert.equal(getProductPlaceholderGradient(cat, null), expected, `${cat} should be SCC indigo`);
    }
  });
});

describe("getProductPlaceholderGradient — DEFAULT fallback (SCC indigo, NOT stone-neutral)", () => {
  const DEFAULT = "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50";
  test("null category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient(null, null), DEFAULT);
  });
  test("undefined category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient(undefined, undefined), DEFAULT);
  });
  test("unknown category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient("UnknownCategory", null), DEFAULT);
  });
  test("empty-string category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient("", null), DEFAULT);
  });
});

describe("PRODUCT_CATEGORY_ICONS — emoji mapping (parity with GLW — icons are not stack-branded)", () => {
  test("Flower → 🌿 (signature green leaf — same on both stacks)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Flower, "🌿");
  });
  test("Pre-Rolls + Pre-Roll → SAME 🫙 icon (plural + singular)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS["Pre-Rolls"], "🫙");
    assert.equal(PRODUCT_CATEGORY_ICONS["Pre-Roll"], "🫙");
  });
  test("All vape categories → 💨", () => {
    for (const cat of ["Vapes", "Cartridge", "Cartridges", "Disposable", "Disposables", "Pod", "Pods"]) {
      assert.equal(PRODUCT_CATEGORY_ICONS[cat], "💨", `${cat} should be 💨`);
    }
  });
  test("Concentrates → 💎", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Concentrates, "💎");
    assert.equal(PRODUCT_CATEGORY_ICONS.Concentrate, "💎");
  });
  test("Edibles → 🍬", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Edibles, "🍬");
  });
  test("Beverages → 🥤", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Beverages, "🥤");
  });
  test("Capsules → 💊", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Capsules, "💊");
  });
  test("Tinctures → 💧", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Tinctures, "💧");
  });
  test("Topicals → 🧴", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Topicals, "🧴");
  });
  test("Accessories → 🛍️", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Accessories, "🛍️");
  });
});

describe("getProductPlaceholderIcon — known category lookup + fallback", () => {
  test("known category → mapped emoji", () => {
    assert.equal(getProductPlaceholderIcon("Flower"), "🌿");
    assert.equal(getProductPlaceholderIcon("Edibles"), "🍬");
  });
  test("unknown category → 🌱 fallback (sprout — generic, NOT stack-branded)", () => {
    assert.equal(getProductPlaceholderIcon("UnknownCategory"), "🌱");
  });
  test("null → 🌱 fallback", () => {
    assert.equal(getProductPlaceholderIcon(null), "🌱");
  });
  test("undefined → 🌱 fallback", () => {
    assert.equal(getProductPlaceholderIcon(undefined), "🌱");
  });
  test("empty-string → 🌱 fallback", () => {
    assert.equal(getProductPlaceholderIcon(""), "🌱");
  });
});
