// Tests for POSTS blog data + helpers.
//
// 13 blog posts power /blog index + /blog/[slug] surfaces. Each post body
// is large prose that gets indexed by Google + AI-engine crawls + rendered
// in /llms-full.txt.
//
// The arc-guard `check-efficacy-claims.mjs` scans this file for regex
// matches — caught real residuals at v17.605 + v19.905 sweeps. This test
// is the 2nd-layer defense pinning specific WSLCB-compliance rules at
// the data level for each post.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { POSTS, getPost, getPosts } from "../posts.ts";

describe("POSTS — structural invariants", () => {
  test("13 posts (canonical count, drift detection)", () => {
    assert.equal(POSTS.length, 13, "expected 13 posts; adding/removing requires intentional update");
  });

  test("every post has all required fields", () => {
    const validCategories = new Set(["Guide", "Vendor Spotlight", "Education", "Local"]);
    for (const p of POSTS) {
      assert.ok(p.slug, `post missing slug`);
      assert.ok(p.title, `${p.slug} missing title`);
      assert.ok(p.description, `${p.slug} missing description`);
      assert.ok(
        validCategories.has(p.category),
        `${p.slug} has invalid category "${p.category}"`,
      );
      assert.ok(p.publishedAt, `${p.slug} missing publishedAt`);
      assert.equal(typeof p.readingMinutes, "number", `${p.slug} readingMinutes not number`);
      assert.ok(p.readingMinutes > 0, `${p.slug} readingMinutes not positive`);
      assert.ok(p.body, `${p.slug} missing body`);
      assert.ok(p.body.length > 500, `${p.slug} body suspiciously short (${p.body.length})`);
    }
  });

  test("slugs are unique", () => {
    const slugs = POSTS.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  });

  test("slugs are URL-safe (lowercase + kebab-case)", () => {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const p of POSTS) {
      assert.match(p.slug, re, `${p.slug} not URL-safe`);
    }
  });

  test("publishedAt is YYYY-MM-DD format", () => {
    const re = /^\d{4}-\d{2}-\d{2}$/;
    for (const p of POSTS) {
      assert.match(p.publishedAt, re, `${p.slug} publishedAt "${p.publishedAt}" not YYYY-MM-DD`);
    }
  });

  test("description is concise (under 250 chars for SERP fit)", () => {
    for (const p of POSTS) {
      assert.ok(
        p.description.length <= 250,
        `${p.slug} description over 250 chars (${p.description.length})`,
      );
    }
  });
});

describe("POSTS — WSLCB compliance pins (2nd layer beyond arc-guard)", () => {
  test("no post body contains 'tends toward sedating/uplifting' causation", () => {
    const re = /\btends?\s+toward\s+(?:more\s+)?(?:sedating|sedative|uplifting|energizing|calming|relaxing)/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} body has causation framing`);
    }
  });

  test("no post body uses 'takes the edge off' symptom-management hedge", () => {
    const re = /\btakes?\s+the\s+edge\s+off/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} body uses 'takes the edge off'`);
    }
  });

  test("no post body says CBD is the 'calmer cannabinoid'", () => {
    const re = /\bcalmer[,\s]+(?:non-intoxicating\s+)?cannabinoid/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses pharmacological comparative for CBD`);
    }
  });

  test("no post body has 'associated with relaxing/energizing' attribution", () => {
    const re = /\bassociated\s+with\s+(?:relaxing|energizing|uplifting|sedating|calming)/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses associative-effect attribution`);
    }
  });

  test("no post body has '= traditionally relaxing/energizing' copula attribution", () => {
    const re = /=\s+traditionally\s+(?:relaxing|energizing|uplifting|sedating|calming)/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses copula-effect attribution`);
    }
  });

  test("no post body has 'Senior discount' (Wisdom rename)", () => {
    const re = /\bSenior\s+discount\b/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses 'Senior discount'`);
    }
  });

  test("no post body has 'locally owned' framing", () => {
    const re = /\blocally[\s-]owned\b/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses 'locally owned'`);
    }
  });
});

describe("getPost helper", () => {
  test("returns matching post for valid slug", () => {
    const first = POSTS[0];
    assert.ok(first);
    const got = getPost(first.slug);
    assert.ok(got);
    assert.equal(got.slug, first.slug);
    assert.equal(got.title, first.title);
  });

  test("returns undefined for unknown slug", () => {
    assert.equal(getPost("not-a-real-post"), undefined);
  });

  test("returns undefined for empty string", () => {
    assert.equal(getPost(""), undefined);
  });
});

describe("getPosts helper", () => {
  test("returns published posts only (≤ POSTS.length, filters draft/unpublished)", () => {
    const got = getPosts();
    assert.ok(got.length > 0, "should return at least one post");
    assert.ok(got.length <= POSTS.length, "should not exceed POSTS array");
  });

  test("returns posts sorted by publishedAt descending (newest first)", () => {
    const got = getPosts();
    for (let i = 1; i < got.length; i += 1) {
      assert.ok(
        got[i - 1].publishedAt >= got[i].publishedAt,
        `post ${i - 1} (${got[i - 1].publishedAt}) should be newer than post ${i} (${got[i].publishedAt})`,
      );
    }
  });
});
