"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MouseGlowProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: "soft" | "medium";
};

export function MouseGlow({ children, className, intensity = "soft" }: MouseGlowProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [lit, setLit] = React.useState(false);
  const reduce = useReducedMotion();

  const onMove = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduce) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--motion-mx", `${x}%`);
      el.style.setProperty("--motion-my", `${y}%`);
      setLit(true);
    },
    [reduce],
  );

  const onLeave = React.useCallback(() => setLit(false), []);

  return (
    <div
      ref={ref}
      className={cn(
        "ce-mouse-glow",
        intensity === "medium" && "ce-mouse-glow--lit",
        lit && "ce-mouse-glow--lit",
        className,
      )}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
