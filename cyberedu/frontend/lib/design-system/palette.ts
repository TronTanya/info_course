/**
 * CyberEdu design system — исходная палитра (синхронизировать с app/design-tokens.css).
 * Контраст (на #060712): primary #F4F2FA ~16:1, secondary #B8B3CC ~8:1, muted #7C7794 ~4.8:1.
 */
export const palette = {
  bg: {
    base: "#060712",
    elevated: "#0C0F1C",
    surface: "#12152A",
  },
  border: "rgba(255, 255, 255, 0.09)",
  accent: {
    primary: "#7C5CFF",
    soft: "#9B87FF",
    violetDeep: "#1A1033",
    cyberMint: "#4CC9A0",
    cyberTeal: "#5EEAD4",
  },
  semantic: {
    warning: "#E8B84A",
    danger: "#F0527A",
  },
  text: {
    primary: "#F4F2FA",
    secondary: "#B8B3CC",
    muted: "#7C7794",
  },
  terminal: {
    bg: "#0D0B18",
    prompt: "#6EE7C4",
    success: "#5CD9A8",
  },
} as const;

export type Palette = typeof palette;
