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
//                   gradient drift. The bright conversion CTA.
//   - "secondary" — outline-only, transparent background, used as the
//                   "Browse Menu" sibling next to a primary CTA.
//
// Use Next's <Link> for in-app routes, plain <a> for external (e.g. the
// iHeartJane shop URL). The component picks the right element based on
// whether `href` starts with http(s).

type Variant = "primary" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    // Animated gradient drift across indigo→violet→indigo plus a violet-tinted
    // glow shadow on hover. The animation is restrained (8s loop) so the
    // button reads as alive, not as a marketing carousel.
    "bg-gradient-to-r from-indigo-800 via-violet-700 to-indigo-800 hover:from-indigo-700 hover:via-violet-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-violet-900/20 hover:shadow-lg hover:shadow-violet-700/30 hover:-translate-y-0.5 animate-gradient",
  secondary:
    "border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold",
};

const SIZE_CLASSES = "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base transition-all";

export function PrimaryCTA({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const cls = `${SIZE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`;
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
