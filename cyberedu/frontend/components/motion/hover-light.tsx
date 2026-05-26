"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HoverLightProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverLight({ children, className }: HoverLightProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      ref.current.style.setProperty("--hover-mx", `${x}%`);
      ref.current.style.setProperty("--hover-my", `${y}%`);
    },
    [reduce],
  );

  return (
    <div ref={ref} className={cn("ce-hover-light", className)} onMouseMove={onMove}>
      {children}
    </div>
  );
}
