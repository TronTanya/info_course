"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ease } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

export function Floating({
  children,
  className,
  slow = false,
  offset = false,
}: {
  children: ReactNode;
  className?: string;
  slow?: boolean;
  offset?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(
        "ce-motion-float",
        slow && "ce-motion-float--slow",
        offset && "ce-motion-float--offset",
        className,
      )}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: slow ? 9 : 7, repeat: Infinity, ease: ease.inOutSoft }}
    >
      {children}
    </motion.div>
  );
}
