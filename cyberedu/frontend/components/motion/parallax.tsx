"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ParallaxLayer({
  children,
  className,
  speed = 0.04,
}: {
  children: ReactNode;
  className?: string;
  /** Scroll parallax factor — keep subtle (0.02–0.06) */
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [20 * speed * 100, -20 * speed * 100]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={cn("ce-parallax-layer", className)} style={{ y }}>
      {children}
    </motion.div>
  );
}
