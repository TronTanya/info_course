import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Solid auth card — без glass/terminal (Stripe-like). */
export function AuthGlassCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ce-auth-card w-full min-w-0", className)}>
      <div className="ce-auth-card__body space-y-6">
        <header className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>
        {children}
        {footer ? <div className="border-t border-border pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
