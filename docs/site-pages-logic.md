# Public site — per-page logic & funnel role

The thesis: **every page is one of three things — discovery, conviction, or transaction.** Discovery widens the top of the funnel (someone who has never heard of us). Conviction narrows trust (someone deciding if we're the right shop). Transaction is the cash-register tap. Small adjustments at each stage compound across thousands of monthly visitors — a 2% lift at /menu lands on every customer; a 2% lift on /faq only lands on the few who reach that page.

What we have to account for:

- **Cases on the floor** — what's physically in the display cases right now. The site has to surface what we want to move *first*. New SKUs only earn shelf space once we sell through the targets we set against existing stock. Until inventoryapp has a "cases full?" gate (queued, see STATUS.md), we manually steer customers toward what's open — via deals, brand pages, and homepage feature slots.
- **What we're trying to sell through** — dead-stock and slow-movers from `/admin/dead-stock` should be over-indexed in the deals page, in the homepage feature row, and in /find-your-strain results when their effects/category match. Same approach: small over-index nudges compound into shelf turnover.
- **What's in stock** — every product surfaced anywhere on the public site comes from `getMenuProducts()` for `iheartjaneStoreId: 5295` (Seattle's iHeartJane store, vs Wenatchee's 5294) which already filters `carry_status != 'discontinued'` and `unit_price >= $1.99`. So we never accidentally sell phantom inventory. Live snapshots flow through within a few minutes of POS.

Pages below are ordered by where in the funnel they live, not alphabetically.

---

## Discovery — pulling people in

### `/` (home)

**Purpose.** First impression. Establish: who we are, where we are, what we sell, why we're trustworthy.

**Funnel role.** Discovery → conviction. About 60% of visits start here when someone Googles "dispensary Rainier Valley", "weed Columbia City", "Mt Baker dispensary", or types our domain.

**What we want them to do.** Click into `/menu` (primary CTA — see feedback_customer_ctas_point_to_menu_only.md), or scroll the brand strip / featured products and click through. Secondary: capture geo-intent for the LocalBusiness JSON-LD that feeds Google's local pack for South Seattle.

**Big-picture tie-in.** This is where local SEO compounds — the `STORE.nearbyNeighborhoods` array (Rainier Valley, Columbia City, Mt Baker, Hillman City, Beacon Hill, Seward Park) drives the `areaServed` schema graph + the metadata description, so search engines see consistent geographic intent every crawl. The neighborhood/transit framing in `NeighborhoodMap.tsx` (with Lake Washington, Mt Baker + Columbia City Link light-rail pins, the 7-bus stop directly in front of 7266 Rainier Ave S) is the highest-yielding "small adjustment" on this page: each pin is a future search-result for "dispensary near {Link station}" or "dispensary on the 7 line".

**Small-adjustments-compound watch list.**
- Homepage hero info card live status → "open now" pill drives walk-in conversions all day, especially the post-work commuter cohort getting off the 7 or the Link
- Featured products row → rotates daily; sub it for sell-through targets when cases are full
- Brand strip ordering → top brands earn placement; rotate in the brand we want to push
- Trust block ("budtenders / Rainier Valley since 2018 / founded 2010 / WSLCB-licensed") → conversion lift on first-time visitors who aren't sure about cannabis retail. **Note:** "locally owned" and "veteran-owned" framings are BOTH forbidden per Doug 2026-05-02 directive (ownership change coming) + WSLCB best practices — `scripts/check-brand-voice-locally-owned.mjs` arc-guard enforces. The founding line is **2010** with **Rainier Valley since 2018** — never "since 2014" (see project_seattle_founding memory).

### `/blog`, `/learn`, `/find-your-strain`

**Purpose.** Long-tail organic search + first-touch trust. Cannabis 101 educates while the funnel does its work.

**Funnel role.** Discovery only — we don't expect a sale from a blog reader on first visit. Goal: rank, capture, and seed the menu CTA so a returning visitor remembers us.

**What we want them to do.** Read, click "Browse the menu" at the bottom, maybe bookmark.

**Big-picture tie-in.** Every published article is a future entry point. `/learn` topics map to product categories, and `/find-your-strain` outputs match real SKUs from our inventory — so a quiz answer of "Energize" hits actual flower we stock at Seattle, not a generic strain encyclopedia.

**Small-adjustments-compound watch list.**
- Adding 1 article/month doubles long-tail surface area in 18 months without doubling work
- South-Seattle-specific topical pegs ("best pre-rolls before a Sounders match", "Link-friendly cannabis stops") earn ranking in a denser, more transit-aware cohort than Wenatchee's
- `/find-your-strain` should over-weight slow-movers when their effects match — a small bias compounds into shelf turnover

### `/brands` + `/brands/[slug]`

**Purpose.** Brand-as-search-target. Customers who already know "I want Phat Panda" land here. Secondary: brand storytelling on the dialed-in pages.

**Funnel role.** Discovery + conviction. The dialed-in pages carry FAQ JSON-LD so AI engines like ChatGPT/Perplexity cite us when someone asks "where is {brand} sold in Seattle" — that's a referral source we don't pay for.

**What we want them to do.** Filter the menu to that brand → click through to /menu.

**Big-picture tie-in.** Each new dialed-in brand page is a permanent SEO asset. The vendor-pages-overhaul initiative (project_vendor_pages_initiative) proves the model one brand at a time before scaling. Vendor logos sourced only from the brand's own site/CDN — never Weedmaps or Leafly aggregators (feedback_vendor_logo_sources).

**Small-adjustments-compound watch list.**
- /deals surfaces vendor logos when brands match → drives traffic to the dialed-in pages from a high-intent surface (deals)
- Sub-brand cards on each brand page filter the product grid → reduces clicks-to-find for customers who know exactly what they want
- A brand page that ranks for one Google keyword stays ranked — the asset compounds even when we stop publishing

---

## Conviction — narrowing trust

### `/about`, `/visit`

**Purpose.** Tell the customer *why* before *what*. Locally-owned, Rainier Valley since 2018, founded 2010, the people behind the counter.

**Funnel role.** Conviction. Visited mostly by first-time customers and Google when ranking us.

**What we want them to do.** Trust → click "Order for Pickup" / "Browse the menu" (always to /menu — `/order` is dev-only).

**Big-picture tie-in.** Locally-owned positioning is a margin moat — chains like Have a Heart and Uncle Ike's can't claim Rainier-Valley-rooted in the same way. Every page that reinforces "founded 2010, Rainier Valley since 2018, 7266 Rainier Ave S, the 7-bus stops at the door, Mt Baker + Columbia City Link a short walk" compounds the brand premium and lets us hold prices vs. higher-volume rivals on Aurora and downtown. WSLCB license **426199**.

**Small-adjustments-compound watch list.**
- Founder bio + photo → first-time visitors who see a face convert better than visitors who see only a logo
- "Rainier Valley since 2018" — small repeat across pages compounds into local-permanence association in a neighborhood that gentrifies fast and rewards staying-power
- `/visit` page — transit + parking detail (the 7 stop in front, paid surface lot, Link 0.6mi) is the single biggest objection-killer for the South-Seattle commuter cohort, who often don't drive

> Note: Seattle does not currently have a `/our-story` route (Wenatchee does). If/when we add one, the conviction narrative deepens — founder origin from Seattle's pre-I-502 era, the 2010 → 2018 Rainier Valley arc, what the neighborhood meant in 2018 and means now.

### `/faq`

**Purpose.** Pre-empt the questions that block a sale. WSLCB requirements, cash-only, ID, parking, transit, hours, returns, loyalty.

**Funnel role.** Conviction → transaction. Customers reach this when they have one specific block. Answering it well removes the block.

**What we want them to do.** Resolve the question → click straight to /menu without bouncing to a competitor.

**Big-picture tie-in.** FAQ entries are the most-asked WSLCB compliance questions plus the South-Seattle-specific ones (transit timing, the 7 stop, Link walk, paid lot details). Each one we answer well is one fewer phone call to staff during peak hours — labor savings that compound. Cash-only is non-negotiable and called out hard (project_pos_cashonly).

### `/press`, `/contact`

**Purpose.** Media inquiries + customer support touchpoints. Low traffic but high downstream value (one Stranger / South Seattle Emerald placement = months of organic traffic).

---

## Transaction — closing

### `/menu` (iHeartJane Boost embed)

**Purpose.** The shop. Every other page on this site funnels here.

**Funnel role.** Transaction. Per feedback_keep_menu_route + feedback_customer_ctas_point_to_menu_only: this is THE order surface — `/order` is dev-only, all CTAs route here. Boost `embedConfigId: 222` against store `5295`.

**What we want them to do.** Add to cart → check out via Boost. Cash on pickup at 7266 Rainier Ave S.

**Big-picture tie-in.** Every UI tweak elsewhere is measured by /menu conversion. /deals card click → /menu landing → cart-add → check-out. Each step has a conversion rate; small lifts at each multiply. Boost CORS is allowlisted against `www.seattlecannabisco.com` — apex requests get silently rejected, so proxy.ts middleware 308-redirects apex → www (reference_iheartjane_cors_origin + feedback_canonical_host_redirect).

**Small-adjustments-compound watch list.**
- iHeartJane Boost bundle hash freshness — see MENU_LOG.md for the recovery recipe (apex vs www diff cost 9 hours on 2026-05-02 — diff what the user can SEE first)
- The fast-fallback panel (auto-shows after 2s of stuck Boost) → recovery path so a stuck render doesn't lose the sale
- Anything we surface upstream that already filters to the right intent (vendor / category / deal) lands at /menu primed to convert

### `/deals`

**Purpose.** Sell-through accelerator + acquisition.

**Funnel role.** Mid-funnel discovery → high-intent transaction. A deal-shopper landing here is unusually close to converting.

**What we want them to do.** Pick a deal → tap "View on menu" → land at /menu pre-filtered by intent.

**Big-picture tie-in.** This is where the *sell-through gate* matters most. If shelves are full of last quarter's flower, /deals should over-weight that flower. Once the sell-through gate (queued) ships, the deals admin will know what's full and steer the daily-deal mailer accordingly. South-Seattle's price-sensitive commuter cohort responds to deals harder than Wenatchee's rural customer, so this surface carries more weight here than at the other store.

**Small-adjustments-compound watch list.**
- v3.4 vendor-art redesign → emotional pull from the bud photo + giant percent-off, beats the prior emoji medallion
- "Shop {Brand} →" pill on vendor matches → cross-funnel into the dialed-in brand page for sustained engagement
- "Ending Soonest" badge on top deal → urgency without being pushy

### `/order`

**Purpose.** Native-menu order flow (eventually replaces Boost). Currently dev-only — not in any customer-facing CTA path.

**Funnel role.** Future transaction surface.

**Big-picture tie-in.** Replacing Boost is the long-term play (zero CORS, zero embed risk, full control of the upsell flow + the "X people viewing" type signals we can't add to Boost). Prereq: email infra (project_public_site_email_infra_unwired) — Seattle has no `/api/orders` and no Resend dep yet, so order confirmations need infra before /order can ship customer-facing.

### `/account`, `/sign-in`, `/sign-up`, `/stash`

**Purpose.** Returning-customer continuity — saved cart, stash, order history.

**Funnel role.** Repeat transaction. Loyalty + cart persistence compound LTV.

**Big-picture tie-in.** Clerk is wired but on dev keys (project_clerk_live_keys_pending) — production keys + saved cart + LTV badges are the next big unlock. Dev keys on production trigger the "Finalize setup" overlay and break customer visits silently (feedback_clerk_dev_keys_blocker).

**Small-adjustments-compound watch list.**
- Cart persistence (24h cookie) — recovers the abandoned-cart cohort
- Order tracker (already shipped on Seattle, predates the Wenatchee port)
- Loyalty preview on home + cart — "you're 23 points from a free pre-roll" beats a pure points number

---

## How small adjustments compound

The math in plain terms: South Seattle's catchment is denser than Wenatchee's — Rainier Valley alone has ~50k residents within 1.5mi of the store, and the 7-bus + Link Light Rail (Mt Baker, Columbia City stations) extend reach into Beacon Hill, Hillman City, Seward Park, and the commuter flow from downtown south. If /menu sees 45,000 visits/month at 18% conversion, a 1-point lift = 450 extra orders/month. At average ticket $48 (transit-cohort baskets skew slightly larger than Wenatchee's drive-through baskets — fewer impulse top-offs, more single-trip stocking), that's $21,600/month from one 1-point lift. Stack 4 lifts (faster page, better vendor surfacing, deal urgency, abandoned-cart recovery) and the surface has materially shifted.

This is why we ship small. Big rewrites require big approvals and rarely outperform a string of small focused improvements that each add 0.5–2 points of conversion on the surface they touch.

---

## What we still owe this doc

- Real numbers per page (visit volume, conversion to /menu click, cart-add rate). Right now we cite the ratios without citing the source. Once `getTodayCustomerMix` is extended with the funnel-stat queries the Explore agent sketched (see STATUS.md), wire them in here.
- `/our-story` page — Wenatchee has it, Seattle doesn't yet. Founder origin from the 2010 pre-I-502 era + the 2018 Rainier Valley re-anchoring is a story worth a dedicated page.
- Email infra (project_public_site_email_infra_unwired) — without `lib/email.ts`, Resend, and `/api/orders`, /order can't graduate from dev-only and pickup confirmations stay manual.
- "Cases full?" gate — once shipped, document the rule for which surface gets sell-through priority (deals first, then home featured, then /find-your-strain bias).
- Indigo-palette accessibility audit — the indigo-on-cream contrast holds, but the indigo-on-charcoal hero variant needs a WCAG check at smaller weights.
