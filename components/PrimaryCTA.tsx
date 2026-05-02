import Link from "next/link";
import type { ReactNode } from "react";

// Single source of truth for the "Order Online — 15% Off" gradient button
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
    // Bright pill with the same drift treatment, but the gradient stays in
    // the indigo-300/fuchsia-200 light range so the dark indigo-950 text
    // keeps WCAG AA contrast against any frame of the animation. Used on
    // dark hero/footer backgrounds.
    "bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-indigo-300 hover:from-indigo-200 hover:via-fuchsia-100 hover:to-indigo-200 active:from-indigo-400 active:to-indigo-400 text-indigo-950 font-bold shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5 animate-gradient",
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
