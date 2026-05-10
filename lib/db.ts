import "server-only";
import { cache } from "react";
import { cleanBrandName } from "./clean-brand-name";

export type VendorBrand = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  logoUrl: string | null;
  imageSource: string | null;
  notes: string | null;
  activeSkus: number;
  brandBio: string | null;
  socialInstagram: string | null;
  socialX: string | null;
  socialFacebook: string | null;
};

export function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require("@neondatabase/serverless");
  return neon(url) as (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<Record<string, unknown>[]>;
}

export type MenuProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  strainType: string | null;
  thcPct: number | null;
  cbdPct: number | null;
  unitPrice: number | null;
  imageUrl: string | null;
  effects: string | null;
  terpenes: string | null;
  /** True when this SKU first appeared in stock within the last 7 days. */
  isNew: boolean;
};

export async function getMenuProducts(): Promise<MenuProduct[]> {
  const sql = getClient();
  // Bug fix 2026-05-04 (Doug: "saying we have things that we dont"):
  //   1. Was `carry_status != 'discontinued'` — INCLUDED phasing_out
  //      products. Now strict `= 'active'`, matching rest of file.
  //   2. NO current-stock filter pre-fix; INNER JOIN to latest_inv now
  //      enforces qty > 0. Mirrors Wenatchee fix + inventoryapp's
  //      lib/menu-server.ts canonical pattern.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT
      p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    LEFT JOIN (
      SELECT product_id, MIN(captured_at) AS first_seen
      FROM inventory_snapshots
      WHERE quantity_on_hand > 0
      GROUP BY product_id
    ) fs ON fs.product_id = p.id
    WHERE p.carry_status = 'active'
      AND li.qty > 0
      AND p.unit_price IS NOT NULL
    ORDER BY p.category NULLS LAST, p.brand NULLS LAST, p.name
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: Boolean(r.is_new),
  }));
}

// Fetch a specific set of product IDs — used by the /stash page to hydrate
// localStorage IDs into full product cards. Returns rows in DB order;
// callers can re-sort to match their input order if needed.
export async function getProductsByIds(ids: string[]): Promise<MenuProduct[]> {
  if (ids.length === 0) return [];
  const sql = getClient();
  // Sister fix to getMenuProducts above. /stash hydrates from localStorage;
  // pre-fix returned items even when out-of-stock or phasing_out, so
  // customer thought they could order from /stash + cart silently had
  // nothing addable. Now strict active + qty > 0.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT
      p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    LEFT JOIN (
      SELECT product_id, MIN(captured_at) AS first_seen
      FROM inventory_snapshots
      WHERE quantity_on_hand > 0
      GROUP BY product_id
    ) fs ON fs.product_id = p.id
    WHERE p.id = ANY(${ids}::text[])
      AND p.carry_status = 'active'
      AND li.qty > 0
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: Boolean(r.is_new),
  }));
}

export async function getFeaturedProducts(limit = 8): Promise<MenuProduct[]> {
  const sql = getClient();
  // Curated mode (migration 0154 / Doug 2026-05-04): if Kat has flipped
  // ON `is_featured` for any active product at /admin/marketing/featured,
  // those win — sorted by featured_priority DESC, name ASC. Falls back to
  // auto-mode (recent updated_at on brands-with-sales) when zero curated.
  const curated = await sql`
    SELECT p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      FALSE AS is_new
    FROM products p
    WHERE p.is_featured = TRUE
      AND p.carry_status = 'active'
      AND p.unit_price IS NOT NULL
    ORDER BY p.featured_priority DESC NULLS LAST, p.name ASC
    LIMIT ${limit}
  `;
  if (curated.length > 0) {
    return curated.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      brand: (r.brand ?? null) as string | null,
      category: (r.category ?? null) as string | null,
      strainType: (r.strain_type ?? null) as string | null,
      thcPct: (r.thc_pct ?? null) as number | null,
      cbdPct: (r.cbd_pct ?? null) as number | null,
      unitPrice: (r.unit_price ?? null) as number | null,
      imageUrl: (r.image_url ?? null) as string | null,
      effects: (r.effects ?? null) as string | null,
      terpenes: (r.terpenes ?? null) as string | null,
      isNew: false,
    }));
  }
  // Bug fix 2026-05-04: pre-fix featured-products carousel could surface
  // products we hadn't had in stock for months. Now requires current
  // qty > 0 via latest_inv CTE. Mirror of greenlife-web fix.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      FALSE AS is_new
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    WHERE p.carry_status = 'active'
      AND p.unit_price IS NOT NULL
      AND p.image_url IS NOT NULL
      AND li.qty > 0
    ORDER BY p.updated_at DESC
    LIMIT ${limit}
  `;
  const mapped = rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
  }));
  if (mapped.length < 4) {
    const fallback = await sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        ORDER BY product_id, captured_at DESC
      ),
      brands_with_recent_sales AS (
        SELECT DISTINCT p.vendor_id
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
          AND p.vendor_id IS NOT NULL
      )
      SELECT p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        FALSE AS is_new
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND li.qty > 0
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `;
    return fallback.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      brand: (r.brand ?? null) as string | null,
      category: (r.category ?? null) as string | null,
      strainType: (r.strain_type ?? null) as string | null,
      thcPct: (r.thc_pct ?? null) as number | null,
      cbdPct: (r.cbd_pct ?? null) as number | null,
      unitPrice: (r.unit_price ?? null) as number | null,
      imageUrl: (r.image_url ?? null) as string | null,
      effects: (r.effects ?? null) as string | null,
      terpenes: (r.terpenes ?? null) as string | null,
      isNew: false,
    }));
  }
  return mapped;
}

// Queue-depth ETA for /order header. Counts pending + in-progress online
// orders to estimate wait time. Bucketed because precision here is fake
// confidence — we don't actually track per-order processing time.
export async function getPickupEta(): Promise<{ depth: number; label: string }> {
  const sql = getClient();
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM online_orders
    WHERE status IN ('pending', 'in_progress')
  `;
  const n = (rows[0]?.n as number) ?? 0;
  let label: string;
  if (n === 0) label = "Usually ready in under 10 min";
  else if (n <= 2) label = "Most orders ready in 10–15 min";
  else if (n <= 5) label = "Currently averaging ~20 min";
  else if (n <= 10) label = "Busy right now — about 25–35 min";
  else label = "Heavy queue — we'll text when ready";
  return { depth: n, label };
}

export type ActiveDeal = {
  id: string;
  name: string;
  description: string | null;
  discountType: "percent" | "dollars";
  discountValue: number | null;
  appliesTo: string | null;
  endDate: string | null;
  /** Pretty short label, e.g. "20% off flower". */
  short: string;
  /** v178.x — when TRUE, deal renders only for PWA-installed customers. */
  appOnly: boolean;
};

// Active deals — status = 'active', today is within the start/end window,
// AND either always-active (day_of_week IS NULL) or day_of_week matches
// today's Pacific-time DOW (0=Sun..6=Sat). DOW filter runs server-side so
// the WA-day-of-week is consistent regardless of the visitor's clock.
//
// Vendor display ads — stage 2 public-site read for the admin curation
// surface in inventoryapp /admin/marketing/vendor-ads (migration 0156).
// Returns active ads for a given placement slot, scoped to this store
// (seattle here). Multiple ads in same slot → priority DESC, fallback to
// most-recent. Date window respected.

export type VendorAd = {
  id: string;
  kind: "vendor" | "house";
  vendorName: string | null;
  imageUrl: string | null;
  headline: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placementSlot: string;
  priority: number | null;
};

export async function getActiveVendorAds(slot: string, limit = 3): Promise<VendorAd[]> {
  const sql = getClient();
  // SELECT excludes any ad whose TODAY's impression count has already
  // reached `daily_impression_cap`. Day boundary computed in store TZ
  // (America/Los_Angeles) so the rollover lines up with Kat's calendar.
  // Lazy-reset semantics: `last_impression_day` != today branch always
  // passes the cap check (yesterday's at-cap counter is irrelevant once
  // the day rolls over). Mirror of greenlife-web/lib/db.ts.
  const rows = await sql`
    SELECT
      va.id, va.kind,
      v.name AS vendor_name,
      COALESCE(ass.file_url, va.image_url) AS image_url,
      va.headline, va.body, va.cta_label, va.cta_url,
      va.placement_slot, va.priority
    FROM vendor_ads va
    LEFT JOIN vendors v ON v.id = va.vendor_id
    LEFT JOIN vendor_assets ass ON ass.id = va.source_asset_id
    WHERE va.status = 'active'
      AND va.placement_slot = ${slot}
      AND (va.start_date IS NULL OR va.start_date <= CURRENT_DATE)
      AND (va.end_date IS NULL OR va.end_date >= CURRENT_DATE)
      AND (va.store_scope IS NULL OR va.store_scope = 'seattle')
      AND (
        va.daily_impression_cap IS NULL
        OR va.last_impression_day IS DISTINCT FROM (NOW() AT TIME ZONE 'America/Los_Angeles')::date
        OR va.impressions_today < va.daily_impression_cap
      )
    ORDER BY va.priority DESC NULLS LAST, va.created_at DESC
    LIMIT ${limit}
  `;
  const ads = rows.map((r) => ({
    id: r.id as string,
    kind: ((r.kind ?? "vendor") as "vendor" | "house"),
    vendorName: r.vendor_name
      ? (cleanBrandName(r.vendor_name as string) || (r.vendor_name as string))
      : null,
    imageUrl: (r.image_url ?? null) as string | null,
    headline: (r.headline ?? null) as string | null,
    body: (r.body ?? null) as string | null,
    ctaLabel: (r.cta_label ?? null) as string | null,
    ctaUrl: (r.cta_url ?? null) as string | null,
    placementSlot: r.placement_slot as string,
    priority: (r.priority ?? null) as number | null,
  }));
  // Best-effort atomic increment / lazy-reset. Failure shouldn't block
  // rendering — render quality > telemetry. Cap-check on the next
  // request catches up if this UPDATE failed.
  if (ads.length > 0) {
    const ids = ads.map((a) => a.id);
    try {
      await sql`
        UPDATE vendor_ads
        SET impressions_today = CASE
              WHEN last_impression_day IS DISTINCT FROM (NOW() AT TIME ZONE 'America/Los_Angeles')::date
                THEN 1
              ELSE impressions_today + 1
            END,
            last_impression_day = (NOW() AT TIME ZONE 'America/Los_Angeles')::date
        WHERE id = ANY(${ids}::text[])
      `;
    } catch {
      // Swallow.
    }
  }
  return ads;
}

// "Just In" — products first stocked within the last 7 days, currently
// in stock, with images. Doug's original phrasing was "featured new
// products"; the curated /admin/marketing/featured surface answers
// "featured", and this answers "new".
export async function getJustInProducts(limit = 12): Promise<MenuProduct[]> {
  const sql = getClient();
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
      FROM inventory_snapshots
      WHERE location_id = 'default'
      ORDER BY product_id, captured_at DESC
    ),
    first_seen AS (
      SELECT product_id, MIN(captured_at) AS first_at
      FROM inventory_snapshots
      WHERE quantity_on_hand > 0
      GROUP BY product_id
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      TRUE AS is_new
    FROM products p
    INNER JOIN first_seen fs ON fs.product_id = p.id
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    WHERE p.carry_status = 'active'
      AND p.unit_price IS NOT NULL
      AND p.unit_price > 0
      AND p.image_url IS NOT NULL
      AND li.qty > 0
      AND fs.first_at >= NOW() - INTERVAL '7 days'
    ORDER BY fs.first_at DESC, p.name ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: true,
  }));
}

// Treasure-chest = staff-curated clearance lane. Doug 2026-05-07: tag slow-
// moving items with display_priority='clearance' from /admin/treasure-chest
// in inventoryapp; this surface renders them on the Seattle public site.
// Mirror of greenlife-web/lib/db.ts getTreasureChestProducts (v4.385).
export async function getTreasureChestProducts(limit = 60): Promise<MenuProduct[]> {
  const sql = getClient();
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
      FROM inventory_snapshots
      WHERE location_id = 'default'
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT
      p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    WHERE p.carry_status = 'active'
      AND p.display_priority = 'clearance'
      AND li.qty > 0
      AND p.unit_price IS NOT NULL
      AND p.unit_price >= 1.99
    ORDER BY p.unit_price ASC NULLS LAST, p.name ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
  }));
}

// Hero-string builder for /deals cards. Doug 2026-05-08 (sister fix in
// greenlife-web): the brand-specific Friday/Sat deals were rendering
// "50% off edibles" in the giant hero text (built from applies_to=edibles)
// instead of "50% off Dope Cooks" — the deal's `name` field already had
// the brand. Fix: when the deal name already reads as marketing copy
// (contains the discount % or $), use it directly (with day-of-week prefix
// stripped). Falls back to the legacy applies_to shape only when the name
// doesn't carry the discount itself.
function buildDealShort(
  name: string,
  val: number | null,
  dt: "percent" | "dollars",
  applies: string | null,
): string {
  if (val == null) return name;
  const cleaned = name.replace(/^(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day:\s*/i, "").trim();
  if (/\d+\s*%\s*off\b/i.test(cleaned) || /\$\d+\b/i.test(cleaned)) return cleaned;
  const suffix = applies && applies !== "all" ? ` ${applies}` : "";
  return dt === "percent" ? `${val}% off${suffix}` : `$${val.toFixed(0)} off${suffix}`;
}

// Order: today's day-specific deals FIRST so the daily-deal mailer headline
// always ranks above the always-on tier (heroes-30, first-visit-30,
// industry-20, etc.). LIMIT 20 to leave headroom for the daily seed
// (2 always-on + 3 today) plus pre-existing site-specific deals.
export async function getActiveDeals(opts?: { includeAppOnly?: boolean }): Promise<ActiveDeal[]> {
  const sql = getClient();
  // App-only filter: when caller passes includeAppOnly=false (or omits it),
  // we hide deals where app_only=true. Caller (page.tsx) reads the install-
  // detection cookie and passes includeAppOnly=true for installed customers.
  // When migration 0216 hasn't run yet (column missing), the COALESCE in the
  // query treats every deal as app_only=false so existing customers see no
  // change. Doug 2026-05-07 — drives the migration funnel.
  const includeAppOnly = opts?.includeAppOnly === true;
  const rows = await sql`
    SELECT
      id, name, description, discount_type, discount_value::float AS discount_value,
      applies_to, end_date::text AS end_date,
      COALESCE(app_only, FALSE) AS app_only
    FROM deals
    WHERE status = 'active'
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      AND (day_of_week IS NULL OR day_of_week = EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Los_Angeles'))::smallint)
      AND (${includeAppOnly} = TRUE OR COALESCE(app_only, FALSE) = FALSE)
    ORDER BY (day_of_week IS NULL) ASC, end_date NULLS LAST, name
    LIMIT 20
  `;
  return rows.map((r) => {
    const dt = (r.discount_type as string) === "dollars" ? "dollars" : "percent";
    const val = (r.discount_value ?? null) as number | null;
    const applies = (r.applies_to ?? null) as string | null;
    const short = buildDealShort(r.name as string, val, dt, applies);
    return {
      id: r.id as string,
      name: r.name as string,
      description: (r.description ?? null) as string | null,
      discountType: dt,
      discountValue: val,
      appliesTo: applies,
      endDate: (r.end_date ?? null) as string | null,
      short,
      appOnly: Boolean(r.app_only),
    };
  });
}

// Small product preview for the /deals/[id] deep page — show 6 in-stock
// products that match the deal's appliesTo category so the customer sees
// what's actually on sale before clicking through to /menu or /order.
//
// Match is case-insensitive ILIKE on the raw category column. Categories
// in the DB look like "Flower", "DOH Flower", "Pre-Roll", etc.; the deal's
// appliesTo is the bucket label ("flower", "pre-rolls"). ILIKE %label%
// catches the spelling variants without us re-implementing normalization
// here.
export async function getCategoryPreviewProducts(
  category: string,
  limit = 6,
): Promise<MenuProduct[]> {
  const sql = getClient();
  // Strip trailing "s" so "Edibles" → "Edible" matches both forms.
  const stem = category.replace(/s$/i, "");
  const pat = `%${stem}%`;
  // Bug fix 2026-05-04: same latest_inv guard as getMenuProducts so home-page
  // category previews don't show items we no longer carry. Mirror of
  // greenlife-web fix.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    WHERE p.carry_status = 'active'
      AND p.unit_price IS NOT NULL AND p.unit_price > 0
      AND p.image_url IS NOT NULL
      AND p.category ILIKE ${pat}
      AND li.qty > 0
    ORDER BY p.updated_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
  }));
}

// Single-deal lookup for the /deals/[id] deep page (SMS-shareable).
// Honors the same active-window filter as getActiveDeals so a stale/expired
// share link 404s instead of showing an old promo. Now also returns the
// `app_only` flag so the page can gate visibility — pre-fix the deep page
// hardcoded `appOnly: false`, meaning a customer could share an app-only
// deal URL and a non-installed recipient could view it directly,
// completely bypassing the install incentive that's the whole point of
// app-only deals (Doug 2026-05-07: "special deals through the app").
export async function getDealById(id: string): Promise<ActiveDeal | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      id, name, description, discount_type, discount_value::float AS discount_value,
      applies_to, end_date::text AS end_date,
      COALESCE(app_only, FALSE) AS app_only
    FROM deals
    WHERE id = ${id}
      AND status = 'active'
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      AND (day_of_week IS NULL OR day_of_week = EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Los_Angeles'))::smallint)
    LIMIT 1
  `;
  const r = rows[0];
  if (!r) return null;
  const dt = (r.discount_type as string) === "dollars" ? "dollars" : "percent";
  const val = (r.discount_value ?? null) as number | null;
  const applies = (r.applies_to ?? null) as string | null;
  const short = buildDealShort(r.name as string, val, dt, applies);
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description ?? null) as string | null,
    discountType: dt,
    discountValue: val,
    appliesTo: applies,
    endDate: (r.end_date ?? null) as string | null,
    short,
    appOnly: Boolean(r.app_only),
  };
}

export async function getActiveBrands(): Promise<VendorBrand[]> {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 2): v4.107 added qty>0 guard, but Doug
  // showed a screenshot of "ABS Buds" (Wenatchee-era brand) rendering
  // on Seattle with 13 FOG concentrate SKUs. Root cause: Seattle's
  // Neon has leaked inventory_snapshots for products that were never
  // actually sold here — a seed-migration leak (per
  // feedback_seed_migrations_must_be_store_aware memory). qty>0 alone
  // can't distinguish "real Seattle inventory" from "ghost inventory
  // from a Wenatchee-seeded product."
  //
  // The strongest "actually carried here" signal is `sale_line_items`:
  // each Neon DB only has THAT store's sales (per CLAUDE.md), so any
  // row in this table = customer paid for it at this register. Adding
  // a `brands_with_recent_sales` CTE that requires ≥1 sale in the last
  // 365d (rolling year) excludes leaked brands without false-positiving
  // legit-but-quiet brands that have at least one tail sale.
  //
  // Tradeoff: a brand-new vendor whose first sale hasn't happened yet
  // would be hidden until that first ring. Acceptable — onboarding-side
  // friction is far less customer-visible than ghost-brand listings.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT
      v.id,
      v.name,
      LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
      v.website,
      v.logo_url,
      v.image_source,
      v.notes,
      v.brand_bio,
      v.social_instagram,
      v.social_x,
      v.social_facebook,
      COUNT(p.id) FILTER (
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND p.unit_price > 0
          AND COALESCE(li.qty, 0) > 0
      )::int AS active_skus
    FROM vendors v
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = v.id
    LEFT JOIN products p ON p.vendor_id = v.id
    LEFT JOIN latest_inv li ON li.product_id = p.id
    GROUP BY v.id
    HAVING COUNT(p.id) FILTER (
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.unit_price > 0
        AND COALESCE(li.qty, 0) > 0
    ) > 0
    ORDER BY v.name
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: cleanBrandName(r.name as string) || (r.name as string),
    slug: r.slug as string,
    website: r.website as string | null,
    logoUrl: r.logo_url as string | null,
    imageSource: r.image_source as string | null,
    notes: r.notes as string | null,
    activeSkus: r.active_skus as number,
    brandBio: (r.brand_bio as string | null) ?? null,
    socialInstagram: (r.social_instagram as string | null) ?? null,
    socialX: (r.social_x as string | null) ?? null,
    socialFacebook: (r.social_facebook as string | null) ?? null,
  }));
}

// Wrapped with React.cache() so generateMetadata + the page component
// share the same result within a single request. Sister of glw same-fix
// — see lib/db.ts there for full context.
export const getBrandBySlug = cache(async (slug: string): Promise<VendorBrand | null> => {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 2): adds the same `brands_with_recent_sales`
  // gate as getActiveBrands so a direct visit to /brands/abs-buds (or
  // any leaked Wenatchee-era slug) returns null → page 404s instead of
  // rendering an empty-products page or — worse — a hand-authored brand
  // override component for a brand we don't actually carry. Strict
  // INNER JOIN here, not left, because we want the function to return
  // null for unrecognized brands, not a half-populated row.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT
      v.id,
      v.name,
      LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
      v.website,
      v.logo_url,
      v.image_source,
      v.notes,
      v.brand_bio,
      v.social_instagram,
      v.social_x,
      v.social_facebook,
      COUNT(p.id) FILTER (
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND p.unit_price > 0
          AND COALESCE(li.qty, 0) > 0
      )::int AS active_skus
    FROM vendors v
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = v.id
    LEFT JOIN products p ON p.vendor_id = v.id
    LEFT JOIN latest_inv li ON li.product_id = p.id
    GROUP BY v.id
    HAVING LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) = ${slug}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id as string,
    name: cleanBrandName(r.name as string) || (r.name as string),
    slug: r.slug as string,
    website: r.website as string | null,
    logoUrl: r.logo_url as string | null,
    imageSource: r.image_source as string | null,
    notes: r.notes as string | null,
    activeSkus: r.active_skus as number,
    brandBio: (r.brand_bio as string | null) ?? null,
    socialInstagram: (r.social_instagram as string | null) ?? null,
    socialX: (r.social_x as string | null) ?? null,
    socialFacebook: (r.social_facebook as string | null) ?? null,
  };
});

export async function getBrandProducts(vendorId: string) {
  const sql = getClient();
  // Bug fix 2026-05-04: pre-fix listed every active+priced product for the
  // vendor regardless of recent inventory. /brands/[slug] was showing
  // "ghost SKUs" for products marked active but with no inventory for
  // months. Now INNER JOINs to latest snapshot, qty > 0. Mirror of the
  // canonical greenlife-web fix.
  const rows = await sql`
    WITH latest_inv AS (
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
      FROM inventory_snapshots
      ORDER BY product_id, captured_at DESC
    ),
    brands_with_recent_sales AS (
      SELECT DISTINCT p.vendor_id
      FROM sale_line_items sli
      INNER JOIN products p ON p.id = sli.product_id
      WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
        AND p.vendor_id IS NOT NULL
    )
    SELECT
      p.id,
      p.name,
      p.brand,
      p.category,
      p.strain_type,
      p.thc_pct::float   AS thc_pct,
      p.cbd_pct::float   AS cbd_pct,
      p.unit_price::float AS unit_price,
      p.image_url,
      p.effects,
      p.terpenes
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    WHERE p.vendor_id = ${vendorId}
      AND p.carry_status = 'active'
      AND p.unit_price IS NOT NULL
      AND p.unit_price > 0
      AND li.qty > 0
    ORDER BY p.category NULLS LAST, p.brand NULLS LAST, p.name
  `;
  return rows as Array<{
    id: string;
    name: string;
    brand: string | null;
    category: string | null;
    strain_type: string | null;
    thc_pct: number | null;
    cbd_pct: number | null;
    unit_price: number | null;
    image_url: string | null;
    effects: string | null;
    terpenes: string | null;
  }>;
}
