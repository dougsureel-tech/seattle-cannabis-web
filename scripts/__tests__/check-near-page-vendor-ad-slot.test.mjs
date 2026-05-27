// Pin test for the `near_page_top` vendor-ad slot wire-in on
// /near/[town]/page.tsx (Doug-directive 2026-05-27 Tier-1 growth).
//
// The /near/<neighborhood> pages are the first-impression surface for
// customers arriving via "<neighborhood> dispensary" organic search.
// They render `<VendorAdSlot slot="near_page_top">` below the H1 +
// breadcrumb, above the body content.
//
// Without this pin, a future refactor (component-extract, layout
// rewrite, ad-removal sweep) could drop the slot silently — the public
// site would still render fine because the slot is empty when no ad is
// active, but the wire-in contract with the admin form (which lets
// Doug pick `near_page_top` from the dropdown) would be broken.
//
// What this pins:
//   1. The page imports `VendorAdSlot`.
//   2. The page renders `<VendorAdSlot slot="near_page_top" .../>`.
//   3. The data-slot marker is present (smoke-test grep anchor).
//
// Sister: inv-App `apps/staff/src/lib/__tests__/vendor-ads.test.ts`
// pins the `near_page_top` enum entry on the admin side.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_PATH = join(process.cwd(), "app/near/[town]/page.tsx");
const PAGE_SRC = readFileSync(PAGE_PATH, "utf8");

describe("/near/[town]/page.tsx — vendor-ad slot wire-in", () => {
  test("imports VendorAdSlot from @/components/VendorAdSlot", () => {
    assert.match(
      PAGE_SRC,
      /import\s*\{\s*VendorAdSlot\s*\}\s*from\s*["']@\/components\/VendorAdSlot["']/,
      "VendorAdSlot import missing — Tier-1 growth wire-in regressed",
    );
  });

  test("renders <VendorAdSlot slot=\"near_page_top\" .../>", () => {
    assert.match(
      PAGE_SRC,
      /<VendorAdSlot\s+slot=["']near_page_top["']/,
      "VendorAdSlot is not rendered with slot=\"near_page_top\"",
    );
  });

  test("data-slot=\"near_page_top\" marker is present (public-site smoke-test anchor)", () => {
    // The smoke test in the ship-report `curl`s the rendered HTML and
    // greps for this exact attribute. Pin the marker so a markup
    // refactor doesn't silently break the deploy-verification step.
    assert.match(
      PAGE_SRC,
      /data-slot=["']near_page_top["']/,
      "data-slot=\"near_page_top\" marker missing — smoke-test will fail",
    );
  });

  test("slot is positioned BELOW the hero (after H1 + breadcrumb)", () => {
    // Generative-SEO + Local-SEO experts both flagged that ad
    // placement above-the-fold-but-below-H1 maximizes attention.
    // Pin the ordering: HERO section must appear in the source
    // BEFORE the VendorAdSlot render.
    const heroIdx = PAGE_SRC.indexOf("HERO");
    const slotIdx = PAGE_SRC.search(/<VendorAdSlot\s+slot=["']near_page_top["']/);
    assert.ok(heroIdx > 0, "HERO section comment marker not found");
    assert.ok(slotIdx > 0, "VendorAdSlot render not found");
    assert.ok(
      slotIdx > heroIdx,
      "VendorAdSlot renders BEFORE the HERO — should render below the H1 + breadcrumb",
    );
  });
});
