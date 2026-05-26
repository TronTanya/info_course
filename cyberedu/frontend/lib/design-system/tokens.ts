/**
 * Design system tokens v3.1 — TypeScript API
 * CSS source of truth: app/design-tokens.css + app/design-system.css
 */

export const spacing = {
  0: "var(--space-0)",
  px: "var(--space-px)",
  0.5: "var(--space-0-5)",
  1: "var(--space-1)",
  1.5: "var(--space-1-5)",
  2: "var(--space-2)",
  2.5: "var(--space-2-5)",
  3: "var(--space-3)",
  3.5: "var(--space-3-5)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  7: "var(--space-7)",
  8: "var(--space-8)",
  9: "var(--space-9)",
  10: "var(--space-10)",
  11: "var(--space-11)",
  12: "var(--space-12)",
  14: "var(--space-14)",
  16: "var(--space-16)",
  20: "var(--space-20)",
  24: "var(--space-24)",
  28: "var(--space-28)",
  32: "var(--space-32)",
  40: "var(--space-40)",
} as const;

export const typography = {
  display: "ds-typo-display",
  h1: "ds-typo-h1",
  h2: "ds-typo-h2",
  h3: "ds-typo-h3",
  body: "ds-typo-body",
  bodyMuted: "ds-typo-muted",
  caption: "ds-typo-caption",
  eyebrow: "ds-typo-eyebrow",
  metric: "ds-typo-metric",
  gradient: "ds-text-gradient",
  /** Legacy aliases (globals.css typo-*) */
  legacyH1: "typo-h1",
  legacyH2: "typo-h2",
  legacyEyebrow: "typo-eyebrow",
} as const;

export const fontSize = {
  xs: "var(--font-size-xs)",
  sm: "var(--font-size-sm)",
  base: "var(--font-size-base)",
  lg: "var(--font-size-lg)",
  xl: "var(--font-size-xl)",
  "2xl": "var(--font-size-2xl)",
  "3xl": "var(--font-size-3xl)",
  "4xl": "var(--font-size-4xl)",
  display: "var(--font-size-display)",
} as const;

export const fontWeight = {
  normal: "var(--font-weight-normal)",
  medium: "var(--font-weight-medium)",
  semibold: "var(--font-weight-semibold)",
  bold: "var(--font-weight-bold)",
} as const;

export const lineHeight = {
  tight: "var(--line-height-tight)",
  snug: "var(--line-height-snug)",
  normal: "var(--line-height-normal)",
  relaxed: "var(--line-height-relaxed)",
} as const;

export const motion = {
  easeOut: "var(--ease-out-expo)",
  easeInOut: "var(--ease-in-out-soft)",
  easeSpring: "var(--ease-spring)",
  instant: "var(--duration-instant)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
  slower: "var(--duration-slower)",
} as const;

export const radii = {
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  "3xl": "var(--radius-3xl)",
  "4xl": "var(--radius-4xl)",
  full: "var(--radius-full)",
} as const;

export const shadows = {
  xs: "shadow-xs",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  inner: "shadow-inner",
  card: "shadow-card",
  cardHover: "shadow-card-hover",
  glow: "shadow-card-hover",
  focus: "shadow-focus",
  modal: "shadow-modal",
} as const;

export const glows = {
  primary: "var(--ce-glow-primary)",
  accent: "var(--ce-glow-accent)",
  soft: "var(--ce-glow-soft)",
  success: "var(--ce-glow-success)",
  danger: "var(--ce-glow-danger)",
  ring: "var(--ce-glow-ring)",
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
