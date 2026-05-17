import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card
      interactive
      className={cn(
        "ce-glass ce-card-glow group h-full border-border/70 transition-[transform,box-shadow,border-color] duration-200 motion-reduce:transition-none",
        className,
      )}
    >
      <CardHeader className="pb-2">
        {icon ? (
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:border-primary/35 group-hover:bg-primary/15">
            {icon}
          </div>
        ) : null}
        <CardTitle className="font-display text-lg leading-snug">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      {children ? <CardContent className="pt-0">{children}</CardContent> : null}
    </Card>
  );
}
