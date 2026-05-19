import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

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
    <GlassCard glow className={cn("ce-auth-glass-card w-full min-w-0 overflow-hidden", className)}>
      <div className="ce-auth-terminal-line border-b border-primary/15 bg-primary/[0.06] px-4 py-2.5 font-mono text-sm sm:px-6">
        <span className="text-muted-foreground">$</span>{" "}
        <span className="text-primary">auth</span>{" "}
        <span className="text-foreground/90">--secure-session</span>
        <span className="ml-2 hidden text-success sm:inline">[encrypted]</span>
      </div>
      <div className="space-y-6 p-5 sm:p-8">
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {description ? <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p> : null}
        </header>
        {children}
        {footer ? <div className="border-t border-border/50 pt-4">{footer}</div> : null}
      </div>
    </GlassCard>
  );
}
