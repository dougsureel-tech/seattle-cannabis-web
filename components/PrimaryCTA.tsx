import Link from "next/link";
import type { ReactNode } from "react";

// Single source of truth for the "Order Online · 20% off" gradient button
// pattern that previously lived inline on the homepage hero, How-Pickup,
// Today's Picks, and footer. Same visual treatment in five different code
// paths is the kind of duplication that ages badly — bumping the gradient,
// shadow, or hover state used to mean five identical edits and a guarantee
// that the next round of color polish would skip one.
//
// Variants:
//   - "primary"   — gradient indigo→violet→indigo, light text, animated
//                   gradient drift. Used on light backgrounds (How Pickup,
//                   Today's Picks) — the bright conversion CTA.
//   - "light"     — bright indigo-300 → fuchsia-200 → indigo-300 gradient
//                   with dark indigo-950 text. Used on dark backgrounds
//                   (hero, footer) where a dark gradient would disappear.
//                   Same animate-gradient drift for visual consistency.
//   - "secondary" — outline-only, transparent background, used as the
//                   "Browse Menu" sibling next to a primary/light CTA on
//                   dark backgrounds.
//
// Use Next's <Link> for in-app routes, plain <a> for external (e.g. the
// iHeartJane shop URL). The component picks the right element based on
// whether `href` starts with http(s).

type Variant = "primary" | "light" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    // Animated gradient drift across indigo→violet→indigo plus a violet-tinted
    // glow shadow on hover. The animation is restrained (8s loop) so the
    // button reads as alive, not as a marketing carousel.
    "bg-gradient-to-r from-indigo-800 via-violet-700 to-indigo-800 hover:from-indigo-700 hover:via-violet-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-violet-900/20 hover:shadow-lg hover:shadow-violet-700/30 hover:-translate-y-0.5 animate-gradient",
  light:
    // Rich indigo→fuchsia→violet gradient with white text and a violet glow
    // shadow — same treatment as the header Order Now button on dark pages.
    // Replaces the washed-out pale lavender that read as flat against the
    // dark hero/footer backgrounds.
    "bg-gradient-to-r from-indigo-500 via-fuchsia-400 to-violet-500 hover:from-indigo-400 hover:via-fuchsia-300 hover:to-violet-400 text-white font-bold shadow-lg shadow-violet-600/40 hover:shadow-xl hover:shadow-violet-500/50 hover:-translate-y-0.5 hover:scale-[1.02] animate-gradient",
  secondary:
    "border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold",
};

type Size = "md" | "sm";

const SIZE_CLASSES: Record<Size, string> = {
  // Default conversion-CTA size used on the homepage hero, How Pickup Works,
  // Today's Picks, and the bottom-of-page block.
  md: "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base transition-all",
  // Denser variant for the pre-footer "by the way" reminder strip and any
  // place a primary CTA needs to share row-space with secondary nav.
  sm: "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
};

export function PrimaryCTA({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const cls = `${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`;
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
