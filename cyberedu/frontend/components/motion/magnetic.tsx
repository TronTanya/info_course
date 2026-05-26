"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

export type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** Pull strength 0–1 */
  strength?: number;
  maxOffset?: number;
};

export function Magnetic({ children, className, strength = 0.22, maxOffset = 14 }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const handleMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const offsetX = (x / rect.width - 0.5) * strength * maxOffset * 2;
      const offsetY = (y / rect.height - 0.5) * strength * maxOffset * 2;
      ref.current.style.setProperty("--btn-mx", `${(x / rect.width) * 100}%`);
      ref.current.style.setProperty("--btn-my", `${(y / rect.height) * 100}%`);
      ref.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    },
    [reduce, strength, maxOffset],
  );

  const handleLeave = React.useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "";
    ref.current.style.setProperty("--btn-mx", "50%");
    ref.current.style.setProperty("--btn-my", "50%");
  }, []);

  return (
    <motion.div
      ref={ref}
      className={cn("ce-magnetic", className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={reduce ? undefined : { scale: 1.015 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={spring.soft}
    >
      {children}
    </motion.div>
  );
}

/** @deprecated Import from @/components/motion/magnetic */
export function MagneticButton(props: MagneticProps) {
  return <Magnetic {...props} className={cn("ce-hero-magnetic-btn", props.className)} />;
}
