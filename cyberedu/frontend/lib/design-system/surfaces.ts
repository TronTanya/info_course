/**
 * Named surface classes — definitions in app/design-system.css + app/globals.css
 */
export const surfaces = {
  glass: "ds-glass",
  glassStrong: "ds-glass ds-glass-strong",
  glassSurface: "ds-glass-surface",
  glassElevated: "ds-glass-surface ds-glass-surface--elevated",
  card: "ds-card",
  cardGlow: "ds-card ds-card--glow",
  cardInteractive: "ds-card ds-card--interactive",
  widget: "ds-widget",
  widgetAccent: "ds-widget ds-widget--accent",
  widgetHero: "ds-widget ds-widget--hero",
  /** Legacy (globals.css) */
  premiumCard: "ce-premium-card",
  premiumCardGlow: "ce-premium-card ce-premium-card--glow",
  premiumCardInteractive: "ce-premium-card ce-premium-card--interactive",
  missionPanel: "ce-mission-panel",
  metricCard: "ce-metric-card",
  metricCardAccent: "ce-metric-card ce-metric-card--accent",
  cyberBadge: "ce-cyber-badge",
  cyberBadgeGlow: "ce-cyber-badge ce-cyber-badge--glow",
} as const;

export type SurfaceKey = keyof typeof surfaces;
