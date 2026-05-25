import * as React from "react";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type LandingFeatureCardProps = {
  className?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function LandingFeatureCard({ className, icon, title, description, children }: LandingFeatureCardProps) {
  return (
    <SectionCard
      variant="default"
      flushTitle
      className={cn(
        "ce-card-glow ce-landing-feature-card ce-landing-glass-tile group h-full motion-reduce:transition-none",
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary ring-1 ring-primary/15 transition-[border-color,background-color,box-shadow] duration-200 group-hover:border-cyan/30 group-hover:bg-primary/12 group-hover:shadow-[0_0_24px_-10px_color-mix(in_oklab,var(--cyan)_35%,transparent)]">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </SectionCard>
  );
}
