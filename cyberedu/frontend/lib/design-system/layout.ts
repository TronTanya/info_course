/**
 * Grid & layout tokens — mirrors CSS in design-tokens.css + design-system.css
 */
export const layout = {
  headerHeight: "var(--header-height)",
  sidebarWidth: "var(--ce-sidebar-width)",
  contentMax: "var(--ce-content-max)",
  contentWide: "var(--ce-content-wide)",
  pageGutter: "var(--ce-page-gutter)",
  gridGap: "var(--ce-grid-gap)",
  gridGapLg: "var(--ce-grid-gap-lg)",
} as const;

export const zIndex = {
  base: "var(--z-base)",
  dropdown: "var(--z-dropdown)",
  sticky: "var(--z-sticky)",
  modal: "var(--z-modal)",
  toast: "var(--z-toast)",
  max: "var(--z-max)",
} as const;

export const containers = {
  page: "container-page",
  ds: "ds-container",
  dsWide: "ds-container ds-container-wide",
  dashboard: "dashboard-grid",
  dashboardWithSidebar: "dashboard-grid dashboard-grid--with-sidebar",
} as const;

export const grids = {
  auto: "ds-grid-auto",
  dashboard: "ds-grid-dashboard",
  responsiveCards: "responsive-card-grid",
} as const;
