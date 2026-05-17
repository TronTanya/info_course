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
  children: React.ReactNode;
};

export function LandingSection({
  id,
  className,
  eyebrow,
  title,
  description,
  headerClassName,
  children,
}: LandingSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section id={id} className={cn("scroll-mt-24 space-y-10", className)} aria-labelledby={headingId}>
      <SectionHeader
        className={cn("mx-auto max-w-3xl flex-col items-center text-center", headerClassName)}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      {headingId ? (
        <h2 id={headingId} className="sr-only">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
