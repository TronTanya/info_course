"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileImmersiveCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className={cn("ce-mobile-immersive-card", className)}
      initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="ce-mobile-immersive-card__inner">{children}</div>
    </motion.article>
  );
}

export function MobileSnapRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ce-mobile-snap-row lg:hidden", className)}>{children}</div>;
}
