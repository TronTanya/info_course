/**
 * Design system tokens (spacing, type scale, motion).
 * CSS variables live in app/globals.css — keep in sync when changing scale.
 */
export const spacing = {
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  16: "var(--space-16)",
} as const;

export const typography = {
  eyebrow: "typo-eyebrow",
  h1: "typo-h1",
  h2: "typo-h2",
  h3: "typo-h3",
  body: "typo-body",
  bodyMuted: "typo-body-muted",
  caption: "typo-caption",
  label: "typo-label",
} as const;

export const motion = {
  easeOut: "var(--ease-out-expo)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
} as const;

export const radii = {
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
} as const;
