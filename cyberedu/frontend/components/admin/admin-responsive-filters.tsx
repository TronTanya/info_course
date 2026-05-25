"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const DESKTOP_MQ = "(min-width: 1024px)";

/**
 * На mobile (< lg) фильтры сворачиваются в disclosure; на desktop всегда развёрнуты.
 */
export function AdminResponsiveFilters({
  children,
  label = "Фильтры",
  className,
  panelClassName,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
  panelClassName?: string;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const panel = (
    <fieldset className={cn("min-w-0 space-y-3 border-0 p-0", panelClassName)}>
      <legend className="sr-only">{label}</legend>
      {children}
    </fieldset>
  );

  if (isDesktop) {
    return <div className={cn("min-w-0", className)}>{panel}</div>;
  }

  return (
    <details className={cn("ce-admin-filters-disclosure group min-w-0", className)}>
      <summary
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-border/80 bg-card/80 px-3 py-2.5 text-sm font-semibold text-foreground",
          "[&::-webkit-details-marker]:hidden",
          focusRing,
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3 min-w-0">{panel}</div>
    </details>
  );
}
