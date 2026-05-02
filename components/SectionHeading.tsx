import type { ReactNode } from "react";

// Single source of truth for the homepage section headings (What We Carry,
// How Pickup Works, Today's Picks, Why Seattle Cannabis Co., Visit Us, etc.).
// The pattern was duplicated 6+ times inline as
//   <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
// — extracting it means a future "tighten heading sizes" or "adopt a new
// gradient signature" change is one edit instead of six.
//
// Variants:
//   - solid (default)  — stone-900, the durable workhorse
//   - gradient         — indigo-900 → violet-800 → indigo-900 bg-clip text
//                        for sections that warrant extra visual weight
//                        (use sparingly — every heading gradient = no heading
//                        gradient).
//
// `eyebrow` and `kicker` are optional small bits above/below the heading so
// callers don't need to wrap. `align` defaults to "center" since most homepage
// sections center their headings.

type Align = "left" | "center";

export function SectionHeading({
  children,
  eyebrow,
  // Defaults to indigo to match the rest of the site identity. Override per-
  // section when the surrounding palette is different (e.g. amber on the
  // sunset "Where you headed?" section).
  eyebrowClassName = "text-indigo-600",
  kicker,
  variant = "solid",
  align = "center",
  className = "",
}: {
  children: ReactNode;
  eyebrow?: ReactNode;
  eyebrowClassName?: string;
  kicker?: ReactNode;
  variant?: "solid" | "gradient";
  align?: Align;
  className?: string;
}) {
  const alignCls = align === "center" ? "text-center" : "text-left";
  const headingCls =
    variant === "gradient"
      ? "text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-900 via-violet-800 to-indigo-900 bg-clip-text text-transparent"
      : "text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900";
  return (
    <div className={`${alignCls} ${className}`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-3 ${eyebrowClassName}`}
        >
          {eyebrow}
        </span>
      )}
      <h2 className={headingCls}>{children}</h2>
      {kicker && <p className="text-stone-400 mt-2 text-sm">{kicker}</p>}
    </div>
  );
}
