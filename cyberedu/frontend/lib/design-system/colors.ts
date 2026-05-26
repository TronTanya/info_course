/**
 * Color tokens — TypeScript mirror of app/design-tokens.css
 */
export const colors = {
  bg: {
    base: "#09090B",
    elevated: "#18181B",
    overlay: "#27272A",
    surface: "#18181B",
    surfaceHover: "#27272A",
  },
  border: {
    default: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.14)",
  },
  brand: {
    primary: "#6366F1",
    primaryHover: "#4F46E5",
    accent: "#818CF8",
    accentSoft: "#A5B4FC",
    violetDeep: "#1E1B4B",
  },
  text: {
    primary: "#F5F5F7",
    secondary: "#A1A1AA",
    muted: "#71717A",
  },
  semantic: {
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F43F5E",
    info: "#60A5FA",
  },
} as const;

export const cssVars = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  primary: "var(--primary)",
  accent: "var(--accent)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  ring: "var(--ring)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
} as const;

export type Colors = typeof colors;
