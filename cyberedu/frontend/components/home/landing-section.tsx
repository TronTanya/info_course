import * as React from "react";
import { LandingPanel } from "@/components/home/landing-panel";
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
  /** Обёртка контента в glass-панель */
  panel?: boolean;
  panelGlow?: boolean;
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
  panel,
  panelGlow,
  children,
}: LandingSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  const body = panel ? <LandingPanel glow={panelGlow}>{children}</LandingPanel> : children;

  return (
    <section
      id={id}
      className={cn("ce-landing-section scroll-mt-28 space-y-10 sm:space-y-12", className)}
      aria-labelledby={headingId}
    >
      <SectionHeader
        className={cn(
          "ce-landing-section-header mx-auto max-w-3xl flex-col items-center text-center",
          headerClassName,
        )}
        eyebrow={eyebrow}
        title={title}
        titleId={headingId}
        description={description}
        accent={accent}
      />
      <div className="ce-landing-section-body">{body}</div>
    </section>
  );
}
