import * as React from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

export type LandingSectionProps = {
  id?: string;
  className?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  headerClassName?: string;
  accent?: boolean;
  children: React.ReactNode;
};

export function LandingSection({
  id,
  className,
  eyebrow,
  title,
  description,
  headerClassName,
  accent,
  children,
}: LandingSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section id={id} className={cn("scroll-mt-24 space-y-10", className)} aria-labelledby={headingId}>
      <SectionHeader
        className={cn("mx-auto max-w-3xl flex-col items-center text-center", headerClassName)}
        eyebrow={eyebrow}
        title={title}
        titleId={headingId}
        description={description}
        accent={accent}
      />
      {children}
    </section>
  );
}
