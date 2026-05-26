"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Subtle animated gradient orbs for sections */
export function GradientAmbient({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="ce-premium-mesh ce-motion-gradient-shift absolute inset-0 opacity-80" />
      {!reduce ? (
        <>
          <motion.div
            className="ce-premium-orb ce-premium-orb--primary absolute left-[-12%] top-[10%] size-[min(36vw,22rem)] opacity-40"
            animate={{ opacity: [0.25, 0.4, 0.25], scale: [1, 1.04, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="ce-premium-orb ce-premium-orb--accent absolute right-[-8%] bottom-[12%] size-[min(32vw,18rem)] opacity-35"
            animate={{ opacity: [0.2, 0.38, 0.2], scale: [1, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </>
      ) : null}
    </div>
  );
}
