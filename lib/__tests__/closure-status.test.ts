// Tests for closure-status.ts — the public site's "is the store closed
// per /admin/hours-override?" probe. Two layers:
//
//   1. inventoryappBase() — env-allow-list defense. If
//      NEXT_PUBLIC_INVENTORYAPP_URL drifts (e.g. to "app.seattlecannabis.co"
//      = 404'd subdomain, sister of inv v337.005 STAFF_APP_URL incident),
//      every closure-status fetch 404s, then the catch path returns
//      `{ isClosed: false }`, then customers CAN PLACE ORDERS during an
//      active emergency closure. The allow-list (`hostname ===
//      "brapp.seattlecannabis.co"`) is the load-bearing defense.
//
//   2. fetchClosureStatus() — the wrapper. Failure modes (timeout, non-ok,
//      empty body, missing `active`) ALL fall back to `{ isClosed: false,
//      reason: null }` — never want a network blip on the closure endpoint
//      to silently block customers from ordering during normal hours.
//
// Why both layers matter together: if the env-allow-list fails OPEN
// (returns a 404 URL instead of the safe default), the fetch wrapper's
// graceful-degrade kicks in and customers ORDER DURING EMERGENCY CLOSURE.
// The allow-list MUST collapse to a working URL, not just "fail safe."

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { inventoryappBase, fetchClosureStatus } from "../closure-status.ts";

const CANONICAL = "https://brapp.seattlecannabis.co";

describe("inventoryappBase — env-allow-list defense", () => {
  const originalEnv = process.env.NEXT_PUBLIC_INVENTORYAPP_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_INVENTORYAPP_URL;
    } else {
      process.env.NEXT_PUBLIC_INVENTORYAPP_URL = originalEnv;
    }
  });

  test("missing env → returns canonical default", () => {
    delete process.env.NEXT_PUBLIC_INVENTORYAPP_URL;
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("empty-string env → returns canonical default", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("non-https env → falls back to default (http insecure)", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "http://brapp.seattlecannabis.co";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("https + canonical hostname → returns input", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://brapp.seattlecannabis.co";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("https + canonical hostname with trailing slash → trimmed", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://brapp.seattlecannabis.co/";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("https + canonical hostname with multiple trailing slashes → all trimmed", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://brapp.seattlecannabis.co///";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("env drift to 'app.*' subdomain (inv v337.005 sister) → falls back to canonical", () => {
    // This is the EXACT class of drift the allow-list defends against:
    // NEXT_PUBLIC_INVENTORYAPP_URL set to a similar-looking but 404'd
    // subdomain. Without the allow-list, every closure-status fetch
    // 404s → graceful degrade returns isClosed=false → customers order
    // during emergency closure.
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://app.seattlecannabis.co";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("https + wrong hostname (evil.example.com) → falls back to canonical", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://evil.example.com";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("https + malformed URL → falls back to canonical (try/catch)", () => {
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://[not a url";
    assert.equal(inventoryappBase(), CANONICAL);
  });

  test("https + canonical + path → falls back to canonical (hostname only allowed)", () => {
    // `new URL("https://brapp.seattlecannabis.co/some/path").hostname`
    // === "brapp.seattlecannabis.co", so the check passes — and the
    // input is returned with trailing slashes stripped. Pin this so a
    // future "let's only accept exact-match origin" tightening would
    // catch the existing call sites.
    process.env.NEXT_PUBLIC_INVENTORYAPP_URL = "https://brapp.seattlecannabis.co/api";
    assert.equal(inventoryappBase(), "https://brapp.seattlecannabis.co/api");
  });
});

describe("fetchClosureStatus — graceful degrade (never block ordering on network blip)", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("network failure → returns { isClosed: false, reason: null }", async () => {
    globalThis.fetch = (() => Promise.reject(new Error("ECONNREFUSED"))) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: false, reason: null });
  });

  test("non-2xx response → returns { isClosed: false, reason: null }", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("error", { status: 500 }))) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: false, reason: null });
  });

  test("404 response → returns { isClosed: false, reason: null }", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("not found", { status: 404 }))) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: false, reason: null });
  });
});

describe("fetchClosureStatus — body parsing", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("active=false → not closed (closure not active per override)", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ active: false, isClosed: true, reason: "Power outage" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: false, reason: null });
  });

  test("active=true + isClosed=false → not closed", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ active: true, isClosed: false, reason: null }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: false, reason: null });
  });

  test("active=true + isClosed=true + reason → closed with reason", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ active: true, isClosed: true, reason: "Power outage" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: true, reason: "Power outage" });
  });

  test("active=true + isClosed=true + empty reason → closed with null reason", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ active: true, isClosed: true, reason: "" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: true, reason: null });
  });

  test("active=true + isClosed=true + whitespace-only reason → closed with null reason", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ active: true, isClosed: true, reason: "   " }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: true, reason: null });
  });

  test("malformed JSON → graceful degrade (no throw)", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("not json", { status: 200 }))) as typeof fetch;
    const got = await fetchClosureStatus();
    assert.deepEqual(got, { isClosed: false, reason: null });
  });
});

describe("fetchClosureStatus — opts.revalidate forwarding", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("no opts → uses cache: no-store (freshest signal for /menu + /order)", async () => {
    let capturedInit: RequestInit | undefined;
    globalThis.fetch = ((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(
        new Response(JSON.stringify({ active: false }), { status: 200 }),
      );
    }) as unknown as typeof fetch;
    await fetchClosureStatus();
    assert.equal(capturedInit?.cache, "no-store");
  });

  test("opts.revalidate=60 → uses Next data cache (not no-store)", async () => {
    let capturedInit: (RequestInit & { next?: { revalidate?: number } }) | undefined;
    globalThis.fetch = ((_url: string, init: RequestInit & { next?: { revalidate?: number } }) => {
      capturedInit = init;
      return Promise.resolve(
        new Response(JSON.stringify({ active: false }), { status: 200 }),
      );
    }) as unknown as typeof fetch;
    await fetchClosureStatus({ revalidate: 60 });
    assert.equal(capturedInit?.next?.revalidate, 60);
    assert.notEqual(capturedInit?.cache, "no-store");
  });
});
