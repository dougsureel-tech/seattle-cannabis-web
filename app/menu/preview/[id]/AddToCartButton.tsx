"use client";

// Add-to-cart button for /menu/preview/[id] PDP. Sister of glw's
// `app/menu/preview/[id]/AddToCartButton.tsx` — same shape, indigo
// brand-token swap (text/bg colors). See glw sister for the cart-payload
// mechanism rationale.

import { useState } from "react";
import { useRouter } from "next/navigation";

type CartProduct = {
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
  isNew: boolean;
  isDohCompliant: boolean;
};

type CartItem = CartProduct & { quantity: number };
type CartPayloadV1 = { v: 1; savedAt: number; items: CartItem[] };

function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("gl_cart");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed as CartItem[];
    if (parsed && typeof parsed === "object" && parsed.v === 1 && Array.isArray(parsed.items)) {
      return (parsed as CartPayloadV1).items;
    }
    return [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const payload: CartPayloadV1 = { v: 1, savedAt: Date.now(), items };
  try {
    localStorage.setItem("gl_cart", JSON.stringify(payload));
  } catch {
    // Silently degrade — see glw sister header.
  }
}

export function AddToCartButton({ product }: { product: CartProduct }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const disabled = product.unitPrice == null;

  function handleAdd() {
    if (disabled || adding) return;
    setAdding(true);
    const items = loadCartItems();
    const existing = items.find((i) => i.id === product.id);
    const next: CartItem[] = existing
      ? items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      : [...items, { ...product, quantity: 1 }];
    persistCart(next);
    router.push("/menu-preview?cart=open");
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || adding}
      className="inline-flex items-center justify-center w-full min-h-[44px] px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      aria-label={`Add ${product.name} to cart`}
      data-testid="pdp-add-to-cart"
    >
      {disabled ? "Currently unavailable" : adding ? "Adding…" : "Add to cart"}
    </button>
  );
}
