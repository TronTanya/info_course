/**
 * Именованные CSS-классы поверхностей (определения в app/globals.css + design-tokens.css).
 */
export const surfaces = {
  glass: "ce-glass",
  premiumCard: "ce-premium-card",
  premiumCardGlow: "ce-premium-card ce-premium-card--glow",
  premiumCardAccent: "ce-premium-card ce-premium-card--accent",
  premiumCardInteractive: "ce-premium-card ce-premium-card--interactive",
  missionPanel: "ce-mission-panel",
  metricCard: "ce-metric-card",
  metricCardAccent: "ce-metric-card ce-metric-card--accent",
  metricCardCyan: "ce-metric-card ce-metric-card--cyan",
  cyberBadge: "ce-cyber-badge",
  cyberBadgeGlow: "ce-cyber-badge ce-cyber-badge--glow",
  statusPill: "ce-status-pill",
  sectionAccent: "ce-section-accent",
  progressRingGlow: "ce-progress-ring-glow",
} as const;

export type SurfaceKey = keyof typeof surfaces;
