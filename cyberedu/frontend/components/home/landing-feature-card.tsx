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
        "ce-premium-card ce-premium-card--interactive group h-full motion-reduce:transition-none",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/18">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </SectionCard>
  );
}
