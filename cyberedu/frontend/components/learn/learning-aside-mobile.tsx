import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { accordionVariants } from "@/lib/design-system/components";
import { cn } from "@/lib/utils";

/** Боковая панель модуля на узких экранах — аккордеон вместо третьей колонки. */
export function LearningAsideMobile({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cn(
        accordionVariants.root,
        "ce-mobile-accordion group open:shadow-card-hover xl:hidden",
        className,
      )}
    >
      <summary className={cn(accordionVariants.trigger, "list-none text-base [&::-webkit-details-marker]:hidden")}>
        <span>{title}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground", accordionVariants.chevron, "group-open:rotate-180")} aria-hidden />
      </summary>
      <div className={cn(accordionVariants.panel, "min-w-0 border-t border-white/6")}>{children}</div>
    </details>
  );
}
