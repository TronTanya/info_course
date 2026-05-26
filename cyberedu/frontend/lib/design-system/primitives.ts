/**
 * Low-level Tailwind primitives — prefer components.ts variant maps for full styles.
 */

export const transitionBase =
  "transition-all duration-normal ease-out-expo motion-reduce:transition-none";

export const focusRing =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const focusRingInset =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

export const interactiveScale =
  "active:scale-98 motion-reduce:active:scale-100";

/** Mirrors `cardVariants` in components.ts — kept here to avoid import cycles. */
export const cardSurface = "ds-card";

export const cardInteractive =
  "ds-card ds-card--interactive ce-hover-light transition-all duration-normal ease-out-expo motion-reduce:transition-none";

export const inputSurface = `ds-input ${transitionBase} ${focusRing}`;

export const badgeBase =
  `inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-medium ${transitionBase}`;
