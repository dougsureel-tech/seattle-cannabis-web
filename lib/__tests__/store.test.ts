// Tests for STORE constant + STORE_TZ + DEFAULT_OG_IMAGE + hoursSummary.
//
// STORE is the single-source-of-truth that drives ~60 customer surfaces:
// sitemap URLs, JSON-LD LocalBusiness graph, contact mailto/tel links,
// hours displays, OpenGraph metadata, footer, /visit page, breadcrumbs.
// A silent drift here cascades to all of them.
//
// Why pin specifically:
//   - phone/phoneTel must mutually agree (E.164 derived from formatted)
//   - website MUST be www.* not apex (proxy.ts CANONICAL_HOST 308's apex
//     → www; SSoT-as-apex meant every emitted URL ate a 308 redirect)
//   - email MUST be rainier@scc (Doug-pinned monitored inbox, not info@)
//   - WSLCB license is regulatory; typo = compliance issue
//   - STORE_TZ MUST be "America/Los_Angeles" (8 modules depend on this
//     constant rather than re-inlining the literal)
//   - DEFAULT_OG_IMAGE 1200x630 matches app/opengraph-image.tsx size

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { STORE, STORE_TZ, DEFAULT_OG_IMAGE, hoursSummary } from "../store.ts";

describe("STORE — identity invariants", () => {
  test("name is the customer-facing brand string", () => {
    assert.equal(STORE.name, "Seattle Cannabis Co.");
  });

  test("tagline references the actual neighborhood", () => {
    assert.match(STORE.tagline, /rainier valley/i);
  });
});

describe("STORE.address — invariants", () => {
  test("address has all required fields", () => {
    assert.ok(STORE.address.street);
    assert.ok(STORE.address.city);
    assert.ok(STORE.address.state);
    assert.ok(STORE.address.zip);
    assert.ok(STORE.address.full);
  });

  test("state is 'WA' (cannabis license is WSLCB)", () => {
    assert.equal(STORE.address.state, "WA");
  });

  test("zip is 5-digit US format", () => {
    assert.match(STORE.address.zip, /^\d{5}$/);
  });

  test("address.full contains street + city + state + zip", () => {
    assert.ok(STORE.address.full.includes(STORE.address.street));
    assert.ok(STORE.address.full.includes(STORE.address.city));
    assert.ok(STORE.address.full.includes(STORE.address.state));
    assert.ok(STORE.address.full.includes(STORE.address.zip));
  });
});

describe("STORE — contact invariants", () => {
  test("phone formatted as (XXX) XXX-XXXX", () => {
    assert.match(STORE.phone, /^\(\d{3}\) \d{3}-\d{4}$/);
  });

  test("phoneTel is E.164 (+1 + 10 digits)", () => {
    assert.match(STORE.phoneTel, /^\+1\d{10}$/);
  });

  test("phoneTel digits match phone digits", () => {
    const phoneDigits = STORE.phone.replace(/\D/g, "");
    const telDigits = STORE.phoneTel.replace(/\D/g, "").slice(1); // drop the leading 1
    assert.equal(phoneDigits, telDigits);
  });

  test("email is plausible address shape", () => {
    assert.match(STORE.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });

  test("email is rainier@seattlecannabis.co (monitored inbox)", () => {
    assert.equal(STORE.email, "rainier@seattlecannabis.co");
  });
});

describe("STORE.website — canonical-host pin", () => {
  test("website is www.* (not apex — proxy.ts CANONICAL_HOST 308's apex)", () => {
    assert.match(STORE.website, /^https:\/\/www\.seattlecannabis\.co$/);
  });

  test("website is https (no trailing slash)", () => {
    assert.match(STORE.website, /^https:\/\//);
    assert.ok(!STORE.website.endsWith("/"), "website MUST NOT have trailing slash");
  });
});

describe("STORE.geo — coordinate sanity", () => {
  test("lat is in Seattle range (~47-48)", () => {
    assert.ok(STORE.geo.lat > 47 && STORE.geo.lat < 48, "lat outside Seattle bounds");
  });

  test("lng is in Seattle range (~-123 to -122)", () => {
    assert.ok(STORE.geo.lng > -123 && STORE.geo.lng < -122, "lng outside Seattle bounds");
  });
});

describe("STORE.hours — invariants", () => {
  test("exactly 7 days covered", () => {
    assert.equal(STORE.hours.length, 7);
  });

  test("days follow Monday-through-Sunday order", () => {
    const expected = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const got = STORE.hours.map((h) => h.day);
    assert.deepEqual(got, expected);
  });

  test("every day has open + close strings", () => {
    for (const h of STORE.hours) {
      assert.match(h.open, /^\d{1,2}:\d{2} (AM|PM)$/, `${h.day} open malformed`);
      assert.match(h.close, /^\d{1,2}:\d{2} (AM|PM)$/, `${h.day} close malformed`);
    }
  });
});

describe("STORE — regulatory + commerce invariants", () => {
  test("wslcbLicense is non-empty digits", () => {
    assert.match(STORE.wslcbLicense, /^\d+$/);
  });

  test("iheartjaneStoreId is a number", () => {
    assert.equal(typeof STORE.iheartjaneStoreId, "number");
    assert.ok(STORE.iheartjaneStoreId > 0);
  });

  test("shopUrl is /menu (NOT /order — see feedback_glw_scc_customer_cta_menu_only)", () => {
    assert.equal(STORE.shopUrl, "/menu");
  });
});

describe("STORE.social — link shape", () => {
  test("instagram is a full https URL", () => {
    assert.match(STORE.social.instagram, /^https:\/\/(www\.)?instagram\.com\//);
  });

  test("facebook is a full https URL", () => {
    assert.match(STORE.social.facebook, /^https:\/\/(www\.)?facebook\.com\//);
  });
});

describe("STORE — neighborhoods + amenities + perks", () => {
  test("nearbyNeighborhoods array is non-empty", () => {
    assert.ok(STORE.nearbyNeighborhoods.length > 0);
  });

  test("amenities contains 'Free parking' (drives /visit page card)", () => {
    assert.ok(STORE.amenities.includes("Free parking"));
  });

  test("perks contains '20% off online orders' (load-bearing CTA)", () => {
    assert.ok(STORE.perks.includes("20% off online orders"));
  });
});

describe("STORE — brand-voice compliance", () => {
  test("no STORE string contains 'Senior discount' (Wisdom rename)", () => {
    const json = JSON.stringify(STORE);
    assert.ok(
      !/senior\s+discount/i.test(json),
      "STORE contains forbidden 'Senior discount' phrase",
    );
  });

  test("no STORE string contains 'locally owned' framing", () => {
    const json = JSON.stringify(STORE);
    assert.ok(
      !/\blocally[\s-]owned\b/i.test(json),
      "STORE contains forbidden 'locally owned' framing",
    );
  });
});

describe("STORE_TZ", () => {
  test("is exactly 'America/Los_Angeles' (SSoT for 8+ modules)", () => {
    assert.equal(STORE_TZ, "America/Los_Angeles");
  });

  test("is a valid IANA TZ (resolves via Intl.DateTimeFormat)", () => {
    // Validate by constructing a formatter; invalid TZs throw RangeError
    assert.doesNotThrow(() => {
      new Intl.DateTimeFormat("en-US", { timeZone: STORE_TZ }).format(new Date());
    });
  });
});

describe("DEFAULT_OG_IMAGE", () => {
  test("url is /opengraph-image (matches Next 16 image convention)", () => {
    assert.equal(DEFAULT_OG_IMAGE.url, "/opengraph-image");
  });

  test("width is 1200 (matches app/opengraph-image.tsx size export)", () => {
    assert.equal(DEFAULT_OG_IMAGE.width, 1200);
  });

  test("height is 630 (matches app/opengraph-image.tsx size export)", () => {
    assert.equal(DEFAULT_OG_IMAGE.height, 630);
  });

  test("type is image/png", () => {
    assert.equal(DEFAULT_OG_IMAGE.type, "image/png");
  });

  test("alt is computed from STORE.name + STORE.address.city", () => {
    assert.ok(DEFAULT_OG_IMAGE.alt.includes(STORE.name));
    assert.ok(DEFAULT_OG_IMAGE.alt.includes(STORE.address.city));
  });
});

describe("hoursSummary — uniform branch (scc)", () => {
  test("returns 'X:XX AM-X:XX PM daily' (scc is uniform 8 AM-11 PM)", () => {
    const got = hoursSummary();
    assert.match(got, / daily$/, `expected uniform format, got "${got}"`);
    assert.ok(got.includes("8:00 AM"));
    assert.ok(got.includes("11:00 PM"));
  });
});
