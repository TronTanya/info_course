"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "ce-learn-os-panel",
  glow: "ce-learn-os-panel ce-learn-os-panel--glow",
  accent: "ce-learn-os-panel ce-learn-os-panel--glow",
  terminal: "ce-learn-os-panel ce-learn-os-panel--terminal",
  mission: "ce-learn-os-panel ce-learn-os-panel--mission",
} as const;

export function LearnOsPanel({
  children,
  className,
  variant = "default",
  animate = true,
  delay = 0,
  id,
  "aria-labelledby": labelledBy,
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  animate?: boolean;
  delay?: number;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const reduce = useReducedMotion();
  const content = (
    <section id={id} className={cn(variants[variant], "min-w-0 p-4 sm:p-5", className)} aria-labelledby={labelledBy}>
      {children}
    </section>
  );

  if (!animate || reduce) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.52, ease: [0.19, 1, 0.22, 1], delay }}
      className="min-w-0"
    >
      {content}
    </motion.div>
  );
}

export function LearnOsEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("ce-learn-os-eyebrow", className)}>{children}</p>;
}
