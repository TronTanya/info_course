import type { ReactNode } from "react";
import type { StateShellVariant } from "@/lib/design-system/ui-state";
import { stateShellClass } from "@/lib/design-system/ui-state";
import { cn } from "@/lib/utils";

export type StateShellProps = {
  variant?: StateShellVariant;
  children: ReactNode;
  className?: string;
  /** Моноширинная метка в шапке (например `status --loading`) */
  terminalLine?: string;
  role?: string;
};

export function StateShell({
  variant = "neutral",
  children,
  className,
  terminalLine,
  role,
}: StateShellProps) {
  return (
    <div
      role={role}
      className={cn(
        "ce-ui-state-shell ce-glass overflow-hidden rounded-2xl",
        stateShellClass[variant],
        className,
      )}
    >
      {terminalLine ? (
        <div className="border-b border-border/50 bg-primary/[0.05] px-4 py-2 font-mono text-xs">
          <span className="text-muted-foreground">$</span>{" "}
          <span className="text-primary">{terminalLine}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
