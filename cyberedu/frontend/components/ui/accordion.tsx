"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { accordionVariants } from "@/lib/design-system/components";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({
  items,
  className,
  allowMultiple = false,
}: {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
}) {
  return (
    <div className={cn(accordionVariants.root, className)} role="region">
      {items.map((item) => (
        <details
          key={item.id}
          className={accordionVariants.item}
          open={item.defaultOpen}
          name={allowMultiple ? undefined : "ds-accordion"}
        >
          <summary className={accordionVariants.trigger}>
            <span>{item.title}</span>
            <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground", accordionVariants.chevron)} aria-hidden />
          </summary>
          <div className={accordionVariants.panel}>{item.content}</div>
        </details>
      ))}
    </div>
  );
}

/** Single glass accordion panel (mobile drawers, FAQ) */
export function AccordionPanel({
  title,
  children,
  className,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details className={cn(accordionVariants.root, className)} open={defaultOpen}>
      <summary className={accordionVariants.trigger}>
        <span>{title}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground", accordionVariants.chevron)} aria-hidden />
      </summary>
      <div className={cn(accordionVariants.panel, "border-t border-white/6 pt-0")}>{children}</div>
    </details>
  );
}
