import type { ReactNode } from "react";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export function CyberPanel({
  children,
  className,
  beam = true,
  staticSurface = false,
}: {
  children: ReactNode;
  className?: string;
  beam?: boolean;
  /** Без анимированной рамки — для вложенных блоков */
  staticSurface?: boolean;
}) {
  return (
    <div
      className={cn(staticSurface ? cyber.panelStatic : beam ? cyber.panel : cyber.panelStatic, className)}
    >
      {children}
    </div>
  );
}
