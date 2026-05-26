"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { blurRevealTransition, motionVariants } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

type BlurRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "article";
  id?: string;
  role?: React.AriaRole;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

export function BlurReveal({
  children,
  className,
  delay = 0,
  y = 22,
  once = true,
  as = "div",
  id,
  role,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
}: BlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-8% 0px -4% 0px" });
  const reduce = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      id={id}
      role={role}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(10px)" }}
      animate={reduce || inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y, filter: "blur(10px)" }}
      transition={blurRevealTransition(delay)}
    >
      {children}
    </Comp>
  );
}

/** Alias for gradual migration from ScrollReveal */
export const ScrollReveal = BlurReveal;

export function BlurRevealGroup({
  children,
  className,
  staggerChildren = 0.06,
  delayChildren = 0.03,
}: {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
  delayChildren?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={reduce || inView ? "show" : "hidden"}
      variants={motionVariants.staggerContainer(delayChildren, staggerChildren)}
    >
      {children}
    </motion.div>
  );
}

export function BlurRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : motionVariants.staggerItem}
    >
      {children}
    </motion.div>
  );
}

/** @deprecated Use BlurRevealItem */
export const StaggerItem = BlurRevealItem;

/** @deprecated Use BlurRevealGroup */
export const StaggerReveal = BlurRevealGroup;
