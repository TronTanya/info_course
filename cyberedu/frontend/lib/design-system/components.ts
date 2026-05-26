/**
 * Component variant maps — single source for UI primitives.
 * CSS definitions: app/design-system.css · tokens: app/design-tokens.css
 */
import { cn } from "@/lib/utils";
import { focusRing, interactiveScale, transitionBase } from "./primitives";

/* ─── Shared ─── */
export const dsFocus = focusRing;
export const dsTransition = transitionBase;
export const dsInteractive = interactiveScale;

/* ─── Buttons ─── */
export const buttonVariants = {
  base: cn("ds-btn", dsTransition, dsInteractive, "[&_svg]:size-4 [&_svg]:shrink-0"),
  primary: "ds-btn--primary",
  secondary: "ds-btn--secondary",
  outline: "ds-btn--outline",
  ghost: "ds-btn--ghost",
  danger: "ds-btn--danger",
  accent: cn(
    "border border-primary/25 bg-primary/12 text-primary",
    "hover:bg-primary/18 hover:shadow-ce-glow-soft",
  ),
  sm: "ds-btn--sm",
  lg: "ds-btn--lg",
  icon: "ds-btn--icon w-full sm:w-auto",
} as const;

export type ButtonVariant = keyof Pick<
  typeof buttonVariants,
  "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent"
>;

/* ─── Inputs ─── */
export const inputVariants = {
  base: "ds-input",
  error: "ds-input--error",
  label: "ds-label",
  hint: "ds-hint",
} as const;

/* ─── Cards ─── */
export const cardVariants = {
  base: "ds-card",
  glow: "ds-card--glow",
  interactive: "ds-card--interactive ce-hover-light",
  header: "ds-card__header",
  body: "ds-card__body",
  footer: "ds-card__footer",
} as const;

/* ─── Modal ─── */
export const modalVariants = {
  overlay: "ds-modal-overlay",
  content: cn("ds-modal-content", dsFocus),
  title: "ds-modal-title",
} as const;

/* ─── Navigation / sidebar ─── */
export const navVariants = {
  sidebar: "ds-sidebar",
  panel: "ds-sidebar-panel",
  link: "ds-nav-link",
  linkActive: "ds-nav-link ds-nav-link--active",
  linkIcon: "ds-nav-link__icon",
} as const;

/* ─── Tabs ─── */
export const tabsVariants = {
  list: "ds-tabs-list",
  trigger: "ds-tabs-trigger",
  content: "ds-tabs-content",
} as const;

/* ─── Alerts ─── */
export const alertVariants = {
  base: "ds-alert",
  default: "ds-alert ds-alert--default",
  primary: "ds-alert ds-alert--primary",
  success: "ds-alert ds-alert--success",
  warning: "ds-alert ds-alert--warning",
  danger: "ds-alert ds-alert--danger",
  info: "ds-alert ds-alert--info",
  accent: "ds-alert ds-alert--primary",
} as const;

export type AlertVariant = keyof Pick<
  typeof alertVariants,
  "default" | "primary" | "success" | "warning" | "danger" | "info" | "accent"
>;

/* ─── Dropdown ─── */
export const dropdownVariants = {
  menu: "ds-dropdown",
  item: "ds-dropdown-item",
  separator: "ds-dropdown-separator",
} as const;

/* ─── Tooltip ─── */
export const tooltipVariants = {
  content: "ds-tooltip",
} as const;

/* ─── Accordion ─── */
export const accordionVariants = {
  root: "ds-accordion",
  item: "ds-accordion-item",
  trigger: "ds-accordion-trigger",
  panel: "ds-accordion-panel",
  chevron: "ds-accordion-chevron",
} as const;

/* ─── Toast ─── */
export const toastVariants = {
  base: "ds-toast",
  default: "ds-toast",
  success: "ds-toast ds-toast--success",
  error: "ds-toast ds-toast--error",
  warning: "ds-toast ds-toast--warning",
  info: "ds-toast ds-toast--info",
} as const;

/* ─── Glass utilities ─── */
export const glassVariants = {
  surface: "ds-glass-surface",
  surfaceElevated: "ds-glass-surface ds-glass-surface--elevated",
  glass: "ds-glass",
  glassStrong: "ds-glass ds-glass-strong",
} as const;

/* ─── Tables ─── */
export const tableVariants = {
  wrap: "ds-table-wrap",
  table: "ds-table",
  head: "",
  row: "",
  cell: "",
} as const;

/* ─── Dashboard widgets ─── */
export const widgetVariants = {
  base: "ds-widget",
  accent: "ds-widget ds-widget--accent",
  hero: "ds-widget ds-widget--hero",
  header: "ds-widget__header",
  body: "ds-widget__body",
  value: "ds-widget__value",
  label: "ds-widget__label",
  span8: "ds-widget-span-8",
  span4: "ds-widget-span-4",
  span12: "ds-widget-span-12",
} as const;

/* ─── Typography (class names) ─── */
export const typeVariants = {
  display: "ds-typo-display",
  h1: "ds-typo-h1",
  h2: "ds-typo-h2",
  h3: "ds-typo-h3",
  body: "ds-typo-body",
  muted: "ds-typo-muted",
  caption: "ds-typo-caption",
  eyebrow: "ds-typo-eyebrow",
  metric: "ds-typo-metric",
  gradient: "ds-text-gradient",
} as const;

/* ─── Layout ─── */
export const layoutVariants = {
  container: "ds-container",
  containerWide: "ds-container ds-container-wide",
  stack: "ds-stack",
  stackLg: "ds-stack ds-stack-lg",
  gridAuto: "ds-grid-auto",
  gridDashboard: "ds-grid-dashboard",
  glass: "ds-glass",
  glassStrong: "ds-glass ds-glass-strong",
} as const;

/** Compose button classes */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size?: "sm" | "lg" | "icon",
  className?: string,
) {
  return cn(
    buttonVariants.base,
    buttonVariants[variant],
    size === "sm" && buttonVariants.sm,
    size === "lg" && buttonVariants.lg,
    size === "icon" && buttonVariants.icon,
    className,
  );
}
