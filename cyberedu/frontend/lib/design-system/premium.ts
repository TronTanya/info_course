/**
 * @deprecated Prefer `components.ts` (`layoutVariants`, `typeVariants`, `widgetVariants`).
 * Kept for backward compatibility with landing / holographic panels.
 */
import { layoutVariants, typeVariants, widgetVariants } from "./components";

export const premium = {
  mesh: "ce-premium-mesh pointer-events-none fixed inset-0 -z-10",
  orbPrimary: "ce-premium-orb ce-premium-orb--primary",
  orbAccent: "ce-premium-orb ce-premium-orb--accent",
  glass: layoutVariants.glass + " rounded-3xl",
  glassGlow: "ds-card ds-card--glow rounded-3xl",
  display: typeVariants.display,
  headline: typeVariants.h2,
  metric: typeVariants.metric,
  eyebrow: typeVariants.eyebrow,
  chip:
    "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground shadow-ce-glow-soft",
  cta: "ds-btn ds-btn--primary ds-btn--lg",
  widget: widgetVariants.base,
  widgetHero: widgetVariants.hero,
} as const;
