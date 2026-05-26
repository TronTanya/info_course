/**
 * CyberEdu palette v4 — sync with app/design-tokens.css
 */
export const palette = {
  bg: {
    base: "#09090B",
    elevated: "#18181B",
    overlay: "#27272A",
    surface: "#18181B",
  },
  border: {
    default: "rgba(255,255,255,0.1)",
    strong: "rgba(255,255,255,0.16)",
  },
  brand: {
    primary: "#6366F1",
    primaryHover: "#4F46E5",
    accent: "#818CF8",
    accentSoft: "#A5B4FC",
    violetDeep: "#1E1B4B",
  },
  semantic: {
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F43F5E",
    info: "#60A5FA",
  },
  text: {
    primary: "#F5F5F7",
    secondary: "#A1A1AA",
    muted: "#71717A",
  },
  terminal: {
    bg: "#18181B",
    prompt: "#818CF8",
    success: "#34D399",
  },
} as const;

export type Palette = typeof palette;
