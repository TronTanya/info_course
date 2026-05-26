import * as React from "react";
import { cardVariants } from "@/lib/design-system/components";
import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const variants = {
  default: cn(cardVariants.base, cardVariants.interactive, "ce-surface-interactive rounded-2xl"),
  muted: cn(cardVariants.base, "rounded-2xl bg-white/2"),
  accent: cn(cardVariants.base, cardVariants.glow, cardVariants.interactive, "ce-surface-interactive rounded-2xl border-primary/25"),
  workspace: cn(cardVariants.base, cardVariants.interactive, "ce-surface-interactive rounded-2xl ring-1 ring-inset ring-primary/10"),
  lab: cn(cardVariants.base, cardVariants.glow, cardVariants.interactive, "ce-premium-card--glow ce-surface-interactive rounded-2xl"),
} as const;

export type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  title?: React.ReactNode;
  description?: React.ReactNode;
  flushTitle?: boolean;
} & Pick<React.ComponentProps<"section">, "id">;

export function SectionCard({
  children,
  className,
  variant = "default",
  title,
  description,
  flushTitle,
  id,
}: SectionCardProps) {
  const hasHeader = Boolean(title || description);
  return (
    <section
      id={id}
      className={cn(variants[variant], transitionBase, "p-5 sm:p-6", className)}
    >
      {hasHeader ? (
        <header className={cn("mb-4 space-y-1", !flushTitle && "border-b border-white/6 pb-4")}>
          {title ? <div className="font-semibold text-foreground">{title}</div> : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
