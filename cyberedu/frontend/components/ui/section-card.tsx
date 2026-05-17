import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "ce-glass border-border shadow-card hover:shadow-card-hover",
  muted: "border-border/80 bg-muted/25 shadow-sm hover:border-border hover:bg-muted/35",
  accent:
    "border-primary/25 bg-linear-to-br from-primary/[0.06] via-card to-accent/[0.06] shadow-card ring-1 ring-inset ring-primary/12 hover:shadow-card-hover",
  workspace:
    "border-primary/25 ce-glass shadow-inner ring-1 ring-inset ring-primary/10 hover:border-primary/35",
} as const;

export type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  /** Заголовок секции */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Убрать нижний разделитель под заголовком */
  flushTitle?: boolean;
} & Pick<React.ComponentProps<"section">, "id">;

/** Карточка-секция: единые radius, border, padding, лёгкий hover. */
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
      className={cn(
        "rounded-2xl border p-5 transition-shadow duration-200 sm:p-6",
        variants[variant],
        className,
      )}
    >
      {hasHeader ? (
        <header className={cn(!flushTitle && "mb-4 border-b border-border/50 pb-3", flushTitle && "mb-4 space-y-1")}>
          {title ? <h3 className="typo-h3">{title}</h3> : null}
          {description ? <p className="typo-caption mt-1">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
