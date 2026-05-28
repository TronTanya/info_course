/**
 * Cyber OS — единые CSS-классы платформы (holographic glass, purple neon, spatial layout).
 */
export const cyber = {
  pageShell: "relative isolate min-w-0 space-y-10 overflow-x-clip md:space-y-12",
  pageInner: "relative z-1 min-w-0 space-y-10 md:space-y-12",
  ambient: "ce-learn-ambient pointer-events-none absolute inset-0 overflow-hidden rounded-inherit",
  grid: "ce-learn-grid absolute inset-0 opacity-15",
  orbA: "ce-premium-orb ce-premium-orb--primary absolute -right-20 top-0 size-64",
  orbB: "ce-premium-orb ce-premium-orb--accent absolute -left-16 bottom-6 size-48",
  hero: "ce-cyber-hero relative overflow-hidden rounded-4xl border border-border bg-card shadow-card",
  heroGrid: "ce-tech-grid pointer-events-none absolute inset-0 opacity-12",
  heroGlow:
    "pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/20 blur-20",
  panel: "ce-holographic ce-learn-panel rounded-5",
  panelStatic: "ce-holographic rounded-5",
  pageHeader:
    "ce-learn-header rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5",
  eyebrow: "typo-eyebrow text-primary",
  monoLabel: "typo-label text-primary/80",
  section: "ce-cyber-section space-y-6",
  marketingSection: "scroll-mt-24 space-y-10",
  backLink:
    "inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/35 hover:bg-primary/8 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
  metric: "ce-metric-card px-4 py-3",
  premiumCard: "ce-premium-card",
  premiumCardGlow: "ce-premium-card ce-premium-card--glow",
  missionPanel: "ce-mission-panel",
  learnOs: "ce-learn-os",
  learnOsPanel: "ce-learn-os-panel",
  learnOsSidebar: "ce-learn-os-sidebar",
  learnOsProgress: "ce-learn-os-progress",
  learnMissionCard: "ce-learn-mission-card",
  missionLab: "ce-mission-lab",
  missionTopbar: "ce-mission-topbar",
  /** Solid surface — no backdrop-filter; do not clip-x (hides first columns of wide tables). */
  adminTable:
    "ce-admin-table-card overflow-x-visible overflow-y-visible rounded-2xl border border-border bg-card shadow-sm",
  adminMobileCard:
    "ce-admin-mobile-card ce-glass rounded-2xl border border-primary/15 p-4 shadow-card",
  adminKpi:
    "ce-glass relative overflow-hidden rounded-2xl border border-primary/15 shadow-card ring-1 ring-primary/8",
  adminPanel: "ce-glass rounded-2xl border border-border/80 shadow-card",
} as const;

export type CyberClassKey = keyof typeof cyber;
