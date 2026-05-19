/**
 * Cyber Lab — единые CSS-классы платформы (dark tech, glass, grid, purple accent).
 * Используйте в компонентах через `cn(cyber.hero, className)`.
 */
export const cyber = {
  pageShell: "relative isolate space-y-8",
  pageInner: "relative z-[1] space-y-8",
  ambient: "ce-learn-ambient pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
  grid: "ce-learn-grid absolute inset-0",
  orbA: "ce-learn-orb absolute -right-16 top-0 size-56 rounded-full blur-3xl",
  orbB: "ce-learn-orb ce-learn-orb-b absolute -left-12 bottom-8 size-40 rounded-full blur-3xl",
  hero: "ce-cyber-hero hero-glow relative overflow-hidden rounded-3xl border border-primary/15 bg-card/85 shadow-card ring-1 ring-primary/8",
  heroGrid: "ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.1]",
  heroGlow: "pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl",
  panel: "ce-glass ce-learn-panel ce-border-beam rounded-2xl shadow-card",
  panelStatic: "ce-glass rounded-2xl border border-border/80 shadow-card",
  pageHeader:
    "hero-glow ce-learn-header ce-border-beam rounded-2xl border border-border/70 bg-card/90 p-4 shadow-card sm:p-5",
  eyebrow: "typo-eyebrow text-primary",
  monoLabel: "typo-label text-primary/80",
  section: "ce-cyber-section space-y-6",
  marketingSection: "scroll-mt-24 space-y-10",
  backLink:
    "inline-flex h-11 min-w-[2.75rem] shrink-0 items-center justify-center rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/35 hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  metric:
    "ce-glass rounded-2xl border border-border/80 px-4 py-3 shadow-card ring-1 ring-primary/8 transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-card",
  adminTable:
    "ce-glass overflow-hidden rounded-2xl border border-primary/15 shadow-card ring-1 ring-primary/8",
  adminMobileCard:
    "ce-admin-mobile-card ce-glass rounded-2xl border border-primary/15 p-4 shadow-card",
  adminKpi:
    "ce-glass ce-border-beam relative overflow-hidden rounded-2xl border border-primary/15 shadow-card ring-1 ring-primary/8",
  adminPanel: "ce-glass rounded-2xl border border-border/80 shadow-card",
} as const;

export type CyberClassKey = keyof typeof cyber;
