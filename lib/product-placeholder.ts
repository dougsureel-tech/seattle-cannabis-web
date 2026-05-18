// Shared placeholder treatment for product cards that lack `image_url`.
// Picks a Tailwind gradient class: strain-type-tinted for Flower/Pre-Rolls
// (where strain is the meaningful shelf signal), category-tinted otherwise.
// Stack-branded defaults — Seattle indigo accent; glw mirror uses emerald.
//
// 2026-05-18 (v28.825): stack-brand Hybrid + DEFAULT + Accessory/Capsule
// gradients so placeholders feel like part of the Seattle indigo chrome
// rather than borrowing emerald from the Wenatchee stack. Sister glw file
// holds the green-tinted Hybrid + DEFAULT for that stack — file-level
// divergence is intentional (per-stack brand), not a mirror drift.

const STRAIN_GRADIENTS: Record<string, string> = {
  Sativa: "bg-gradient-to-br from-red-100 via-orange-50 to-amber-100",
  // Indica = purple-leaning (semantic); we deepen indigo here so on SCC
  // it sings against the indigo chrome.
  Indica: "bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100",
  // Hybrid was emerald (glw brand). On SCC, swap to indigo/violet so the
  // most-common shelf-section placeholder doesn't fight the brand.
  Hybrid: "bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-100",
  CBD: "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Edibles: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
  Edible: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
  Vapes: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Cartridge: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Cartridges: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Disposable: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Disposables: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Pod: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Pods: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Concentrates: "bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100",
  Concentrate: "bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100",
  Beverages: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
  Beverage: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
  Tinctures: "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
  Tincture: "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
  Topicals: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  Topical: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  // Capsules + Accessories were stone/slate (dead-neutral). Stack-tint to
  // indigo so they read as part of the SCC surface, not as missing-art.
  Capsules: "bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50",
  Capsule: "bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50",
  Accessories: "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50",
  Accessory: "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50",
};

// DEFAULT_GRADIENT was stone-neutral — replaced with a subtle indigo tint
// so the fallback-of-fallbacks still belongs to SCC chrome.
const DEFAULT_GRADIENT = "bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50";

export const PRODUCT_CATEGORY_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  "Pre-Roll": "🫙",
  Vapes: "💨",
  Cartridge: "💨",
  Cartridges: "💨",
  Disposable: "💨",
  Disposables: "💨",
  Pod: "💨",
  Pods: "💨",
  Concentrates: "💎",
  Concentrate: "💎",
  Edibles: "🍬",
  Edible: "🍬",
  Beverages: "🥤",
  Beverage: "🥤",
  Capsules: "💊",
  Capsule: "💊",
  Tinctures: "💧",
  Tincture: "💧",
  Topicals: "🧴",
  Topical: "🧴",
  Accessories: "🛍️",
  Accessory: "🛍️",
};

export function getProductPlaceholderGradient(
  category: string | null | undefined,
  strainType: string | null | undefined,
): string {
  const isFlowerLike = category === "Flower" || (category?.startsWith("Pre-Roll") ?? false);
  if (isFlowerLike && strainType && STRAIN_GRADIENTS[strainType]) {
    return STRAIN_GRADIENTS[strainType];
  }
  if (category && CATEGORY_GRADIENTS[category]) {
    return CATEGORY_GRADIENTS[category];
  }
  return DEFAULT_GRADIENT;
}

export function getProductPlaceholderIcon(category: string | null | undefined): string {
  return PRODUCT_CATEGORY_ICONS[category ?? ""] ?? "🌱";
}
