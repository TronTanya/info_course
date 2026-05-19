import type { ReactNode } from "react";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

/** Карточка строки в мобильных списках админки (единый glass + hover). */
export function AdminMobileCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(cyber.adminMobileCard, className)}>{children}</div>;
}
