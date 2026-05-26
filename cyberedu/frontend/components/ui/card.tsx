import * as React from "react";
import { cardVariants } from "@/lib/design-system/components";
import { transitionBase } from "@/lib/design-system/primitives";
import { typography } from "@/lib/design-system/tokens";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  gradient?: boolean;
  interactive?: boolean;
  glow?: boolean;
};

export function Card({ className, gradient, interactive, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        cardVariants.base,
        transitionBase,
        glow && cardVariants.glow,
        interactive && cardVariants.interactive,
        gradient && "bg-(image:--gradient-card)",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardVariants.header, className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(typography.h3, "leading-none", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typography.caption, className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardVariants.body, className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardVariants.footer, className)} {...props} />;
}
