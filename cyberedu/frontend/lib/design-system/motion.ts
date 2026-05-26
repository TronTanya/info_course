/**
 * Premium motion system — Framer Motion presets (sync with app/design-tokens.css)
 */

import type { Transition, Variants } from "framer-motion";

export function motionWithReducedMotion<T extends Record<string, unknown>>(preset: T, reduce: boolean | null): T {
  if (!reduce) return preset;
  return {
    ...preset,
    initial: false,
    exit: undefined,
    transition: { duration: 0 },
    animate: undefined,
    whileHover: undefined,
    whileTap: undefined,
  } as T;
}

/** Cinematic easing — expensive, soft deceleration */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.22, 1, 0.36, 1] as const,
  inOutSoft: [0.45, 0, 0.55, 1] as const,
  luxury: [0.19, 1, 0.22, 1] as const,
} as const;

export const spring = {
  soft: { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.8 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 32, mass: 0.6 },
  gentle: { type: "spring" as const, stiffness: 180, damping: 26, mass: 1 },
} as const;

export const duration = {
  fast: 0.18,
  normal: 0.32,
  slow: 0.52,
  page: 0.48,
  blur: 0.62,
} as const;

export const stagger = {
  tight: 0.04,
  default: 0.06,
  relaxed: 0.09,
  slow: 0.12,
} as const;

const blurHidden = { opacity: 0, y: 20, filter: "blur(10px)" };
const blurShow = { opacity: 1, y: 0, filter: "blur(0px)" };

export const motionVariants = {
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: duration.normal, ease: ease.outExpo } },
    exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.outExpo } },
  },
  blurUp: {
    hidden: blurHidden,
    show: {
      ...blurShow,
      transition: { duration: duration.blur, ease: ease.luxury },
    },
    exit: { opacity: 0, y: 10, filter: "blur(6px)", transition: { duration: duration.fast, ease: ease.outExpo } },
  },
  blurUpItem: {
    hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  },
  scaleBlur: {
    hidden: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: duration.slow, ease: ease.outExpo },
    },
  },
  page: {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: duration.page, ease: ease.luxury },
    },
    exit: {
      opacity: 0,
      y: -8,
      filter: "blur(4px)",
      transition: { duration: duration.fast, ease: ease.outExpo },
    },
  },
  float: {
    animate: {
      y: [0, -6, 0],
      transition: { duration: 7, repeat: Infinity, ease: ease.inOutSoft },
    },
  },
  staggerContainer: (delayChildren = 0.04, staggerChildren: number = stagger.default): Variants => ({
    hidden: {},
    show: {
      transition: { delayChildren, staggerChildren },
    },
  }),
  staggerItem: {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  },
} as const;

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.normal, ease: ease.outExpo },
  },
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: duration.normal, ease: ease.outExpo },
  },
  slideDown: {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: duration.normal, ease: ease.outExpo },
  },
  blurIn: {
    initial: blurHidden,
    animate: blurShow,
    exit: { opacity: 0, y: 8, filter: "blur(6px)" },
    transition: { duration: duration.blur, ease: ease.luxury },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.98, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.99, filter: "blur(4px)" },
    transition: { duration: duration.normal, ease: ease.outExpo },
  },
  modal: {
    initial: { opacity: 0, scale: 0.97, y: 8, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.98, y: 4, filter: "blur(4px)" },
    transition: { duration: duration.normal, ease: ease.outExpo },
  },
  pageEnter: {
    initial: motionVariants.page.hidden,
    animate: motionVariants.page.show,
    exit: motionVariants.page.exit,
  },
  stagger: stagger.default,
  staggerSlow: stagger.relaxed,
  hoverLift: {
    whileHover: { y: -2, transition: { duration: duration.fast, ease: ease.outExpo } },
    whileTap: { scale: 0.985, transition: { duration: 0.12, ease: ease.outExpo } },
  },
  glowPulse: {
    animate: {
      boxShadow: ["var(--ce-glow-soft)", "var(--ce-glow-primary)", "var(--ce-glow-soft)"],
    },
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
} as const;

export function pageTransition(skip: boolean): {
  initial: boolean | typeof motionVariants.page.hidden;
  animate: typeof motionVariants.page.show;
  exit: typeof motionVariants.page.exit | undefined;
} {
  if (skip) {
    return { initial: false, animate: motionVariants.page.show, exit: undefined };
  }
  return {
    initial: motionVariants.page.hidden,
    animate: motionVariants.page.show,
    exit: motionVariants.page.exit,
  };
}

export function blurRevealTransition(delay = 0): Transition {
  return { duration: duration.blur, delay, ease: ease.luxury };
}

/** CSS animation class presets */
export const cssAnimations = {
  fadeIn: "ds-animate-fade ce-motion-blur-in",
  slideUp: "ds-animate-in",
  glowPulse: "ds-animate-glow ce-motion-gradient-shift",
  stagger1: "ce-motion-stagger-1",
  stagger2: "ce-motion-stagger-2",
  stagger3: "ce-motion-stagger-3",
  stagger4: "ce-motion-stagger-4",
  float: "ce-motion-float",
  hoverLight: "ce-hover-light",
} as const;
