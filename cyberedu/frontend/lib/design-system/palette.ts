/**
 * CyberEdu design system — исходная палитра (синхронизировать с app/design-tokens.css).
 * Контраст (на #05030A): primary #F5F3FF ~16:1, secondary #A8A2B8 ~7.5:1, subtle #6F6880 ~4.6:1 (крупный текст / captions).
 */
export const palette = {
  bg: {
    base: "#05030A",
    elevated: "#0B0714",
    surface: "#100A1F",
  },
  border: "rgba(255, 255, 255, 0.08)",
  accent: {
    primary: "#863BFF",
    violetDeep: "#140033",
    cyberGreen: "#39FF88",
  },
  semantic: {
    warning: "#FACC15",
    danger: "#FF4D6D",
  },
  text: {
    primary: "#F5F3FF",
    secondary: "#A8A2B8",
    muted: "#6F6880",
  },
} as const;

export type Palette = typeof palette;
