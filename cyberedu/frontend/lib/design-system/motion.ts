/** Framer Motion presets — keep durations in sync with globals.css */

/** Отключает входную анимацию при prefers-reduced-motion. */
export function motionWithReducedMotion<T extends Record<string, unknown>>(preset: T, reduce: boolean | null): T {
  if (!reduce) return preset;
  return {
    ...preset,
    initial: false,
    exit: undefined,
    transition: { duration: 0 },
  } as T;
}

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  slideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  stagger: 0.06,
  hoverLift: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
  },
  glowPulse: {
    animate: {
      boxShadow: [
        "0 0 0 0 color-mix(in oklab, var(--primary) 0%, transparent)",
        "0 0 24px 2px color-mix(in oklab, var(--primary) 14%, transparent)",
        "0 0 0 0 color-mix(in oklab, var(--primary) 0%, transparent)",
      ],
    },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
} as const;
