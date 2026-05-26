"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Cinematic ambient layer: mesh, floating violet orbs, subtle scanline. */
export function TechAmbient() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="ce-tech-ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="ce-premium-mesh ce-motion-gradient-shift absolute inset-0" />
      <div className="ce-tech-grid absolute inset-0 opacity-22 dark:opacity-18" />
      <motion.div
        className="ce-premium-orb ce-premium-orb--primary absolute left-[-10%] top-[6%] size-[min(44vw,32rem)]"
        animate={reduceMotion ? undefined : { opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ce-premium-orb ce-premium-orb--accent absolute right-[-6%] top-[32%] size-[min(38vw,26rem)]"
        animate={reduceMotion ? undefined : { opacity: [0.28, 0.48, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="ce-orb ce-orb-c absolute bottom-[8%] left-[28%] size-[min(28vw,18rem)] opacity-30"
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {!reduceMotion ? <div className="ce-tech-scanline absolute inset-0 opacity-25" /> : null}
    </div>
  );
}
