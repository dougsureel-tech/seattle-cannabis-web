// Online-pricing engine. Doug 2026-05-16: "minimum 20% bc of online, more
// with daily deals." Every customer ordering online via /menu (and post-
// cutover /menu) sees a strikethrough original price + a discounted price.
// Daily deals layer on top — the BIGGER of (20% online floor, daily-deal %)
// wins; deals do NOT stack on top of the floor.
//
// Path A semantics (Doug greenlit 2026-05-16): the discounted price is the
// REAL cart charge, not display-only. Cart line items store the discounted
// price; order submission sends the discounted price; line-item math at
// checkout is automatically correct because the cart's `unitPrice` field
// is already the post-discount number. Sister glw `lib/online-pricing.ts`.

import type { ActiveDeal, MenuProduct } from "@/lib/db";

export const ONLINE_DISCOUNT_PCT = 20;

// Find the active deal that applies to a given product. Storewide deals
// match every product; category-scoped deals match by stem.
export function findDealForProduct(
  p: Pick<MenuProduct, "category">,
  deals: ActiveDeal[],
): ActiveDeal | null {
  if (!deals || deals.length === 0) return null;
  const cat = (p.category ?? "").toLowerCase();
  for (const d of deals) {
    if (!d.appliesTo || d.appliesTo === "all") return d;
    const stem = d.appliesTo.toLowerCase().replace(/s$/, "");
    if (cat.includes(stem)) return d;
  }
  return null;
}

export type EffectivePrice = {
  displayPrice: number | null;
  originalPrice: number | null;
  discountPct: number;
  dealName: string | null;
};

export function effectivePriceFor(
  product: Pick<MenuProduct, "unitPrice" | "category">,
  applicableDeal: ActiveDeal | null,
): EffectivePrice {
  if (product.unitPrice == null) {
    return { displayPrice: null, originalPrice: null, discountPct: 0, dealName: null };
  }
  const originalPrice = product.unitPrice;
  let bestPct = ONLINE_DISCOUNT_PCT;
  let dealName: string | null = null;

  if (applicableDeal && applicableDeal.discountValue != null) {
    const dealPct =
      applicableDeal.discountType === "percent"
        ? applicableDeal.discountValue
        : (applicableDeal.discountValue / originalPrice) * 100;
    if (dealPct > bestPct) {
      bestPct = dealPct;
      dealName = applicableDeal.short;
    }
  }

  const displayPrice = Math.round(originalPrice * (1 - bestPct / 100) * 100) / 100;
  return {
    displayPrice,
    originalPrice,
    discountPct: Math.round(bestPct * 10) / 10,
    dealName,
  };
}
