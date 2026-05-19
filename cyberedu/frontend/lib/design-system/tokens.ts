/**
 * Design system tokens (spacing, type scale, motion, shadows).
 * CSS variables live in app/design-tokens.css — keep in sync when changing scale.
 */
export const spacing = {
  0: "var(--space-0)",
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  14: "var(--space-14)",
  16: "var(--space-16)",
  20: "var(--space-20)",
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

export const fontSize = {
  xs: "var(--font-size-xs)",
  sm: "var(--font-size-sm)",
  base: "var(--font-size-base)",
  lg: "var(--font-size-lg)",
  xl: "var(--font-size-xl)",
} as const;

export const lineHeight = {
  tight: "var(--line-height-tight)",
  snug: "var(--line-height-snug)",
  normal: "var(--line-height-normal)",
  relaxed: "var(--line-height-relaxed)",
} as const;

export const motion = {
  easeOut: "var(--ease-out-expo)",
  easeInOutSoft: "var(--ease-in-out-soft)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
} as const;

export const radii = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  "3xl": "var(--radius-3xl)",
  full: "var(--radius-full)",
} as const;

/** Tailwind shadow utilities mapped to CSS variables */
export const shadows = {
  sm: "shadow-sm",
  card: "shadow-card",
  cardHover: "shadow-card-hover",
  glow: "shadow-glow",
} as const;

export const semanticColors = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "accent",
  "muted",
  "border",
  "ring",
  "success",
  "warning",
  "danger",
  "cyan",
] as const;
