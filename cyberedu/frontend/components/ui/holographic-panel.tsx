"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { transitionBase } from "@/lib/design-system/primitives";
import { premium } from "@/lib/design-system/premium";
import { cn } from "@/lib/utils";

export type HolographicPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  animate?: boolean;
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8 lg:p-10",
} as const;

export function HolographicPanel({
  className,
  glow = false,
  padding = "md",
  animate = true,
  children,
  id,
  role,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: HolographicPanelProps) {
  const reduceMotion = useReducedMotion();
  const surfaceClass = cn(
    glow ? premium.glassGlow : premium.glass,
    paddings[padding],
    transitionBase,
    className,
  );

  if (animate && !reduceMotion) {
    return (
      <motion.div
        className={surfaceClass}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        id={id}
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={surfaceClass}
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  );
}
