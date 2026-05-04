// Build identity exposed in the footer so Doug can verify a deploy landed.
// Bump BUILD_VERSION manually for major UX/feature changes; the short SHA
// comes from Vercel automatically on every deploy and is the authoritative
// "did my push actually land" signal.

// 4.102 — `/order` + `/shop` + `/stash` product filter tightened (Doug bug report 2026-05-04 "saying we have things that we dont"). `getMenuProducts` + `getProductsByIds` in `lib/db.ts` now require strict `carry_status = 'active'` AND INNER JOIN to a latest-snapshot `qty > 0` CTE. Pairs with v4.101 brand-page tightening: same root cause, different surfaces. Mirror on greenlife-web v3.182.
// 4.101 — `/brands/[slug]` + `/brands` tightened product filter (Kat bug report 2026-05-04). `getActiveBrands` + `getBrandBySlug` + `getBrandProducts` in `lib/db.ts` now require `carry_status = 'active' AND unit_price > 0` instead of the looser `carry_status != 'discontinued'`. Kat: Bon Bombs were rendering on the Seattle brands page despite never having been carried in Seattle; samples were rendering on both stores. The looser filter let phasing-out vendors + $0-priced placeholder rows through. Same change shipped to greenlife-web v3.181. SQL stays one query each, no N+1 introduced.
// 4.96 — Apply form `?position=` deep-link support — when /careers links to /apply?position={id}, form fetches position from inventoryapp API, pre-selects role + shows 'Applying for: {title}' pill at top. Hidden positionId field passes the link to /api/applications. Silent fallback when fetch fails or position no longer open.
// 4.91 — Public /careers landing (Hiring Phase 5). Fetches open positions from inventoryapp /api/positions/open?store=seattle with 5-min ISR + 5s fetch timeout (falls back to "we keep good resumes on file" empty state on any failure). Position cards: title, store badges, pay-range/hours-pattern chips, safe-markdown description (XSS-safe — paragraphs/bullets/**bold** only, no HTML pass-through), "Apply for this role" CTA deep-linking /apply?position={id}. Hero leans on the "since 2010, on Rainier since 2018" heritage angle. Indigo/violet theme matching SCC chrome. Mirror on greenlife-web v3.171.
// 4.86 — Public /vendor-access self-serve form for brand partners (PLAN_VENDOR_ASSETS_PORTAL path B). Lands at /vendor-access — collects company + contact + email + phone + brand confirmation + intent — POSTs JSON to inventoryapp /api/vendor-access — feeds existing /admin/vendor-access-requests admin queue. Indexed (canonical), thanks page noindex. Free-text only — no file upload. Mirror page on greenlife-web v3.166.
// 4.81 — /brands/[slug] generic-template renders vendor-authored brand bio + Instagram/X/Facebook handles when filled in via /vmi/profile (inventoryapp). Section sits above the order CTA, only renders when at least one field is non-null. Handles are sanitized to /^[A-Za-z0-9._-]+$/ before being concatenated into URLs (prevents query-param injection or path traversal). Per-brand override components intentionally NOT touched — those are graduated, hand-authored layouts.
// 4.76 — /apply personality prompts: two optional written prompts (product-recommendation pitch + customer-recovery story) capture personality signal without the photo discrimination risk. Stored in applicants.metadata JSONB on inventoryapp side. Compliance: written-only — no photo (WA RCW 49.60 / EEOC pre-offer photo discrimination risk).
// 4.71 — Public /apply form: apply-to-work intake with resume upload + 3 references + 21+ confirmation. POSTs to inventoryapp /api/applications. Compliance: no photo / no SSN / no DOB.
export const BUILD_VERSION = "4.102";

export const BUILD_SHA = (
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  "dev"
).slice(0, 7);
