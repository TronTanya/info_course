"use client";

import type { ReactNode } from "react";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export function CyberAmbient() {
  return (
    <div className={cyber.ambient} aria-hidden>
      <div className={cyber.grid} />
      <div className={cyber.orbA} />
      <div className={cyber.orbB} />
    </div>
  );
}

export function CyberPageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(cyber.pageShell, className)}>
      <CyberAmbient />
      <div className={cyber.pageInner}>{children}</div>
    </div>
  );
}
