import * as React from "react";
import { cardSurface, transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  gradient?: boolean;
  interactive?: boolean;
};

export function Card({ className, gradient, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        cardSurface,
        transitionBase,
        gradient && "bg-[image:var(--gradient-card)]",
        interactive &&
          "hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)] hover:shadow-[var(--shadow-glow)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-2 p-6 pt-0", className)} {...props} />;
}
