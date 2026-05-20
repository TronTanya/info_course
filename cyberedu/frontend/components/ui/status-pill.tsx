import { StatusBadge, type StatusBadgeProps } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export type StatusPillProps = StatusBadgeProps;

/** Скруглённый статус — обёртка над StatusBadge с pill-стилем. */
export function StatusPill({ className, ...props }: StatusPillProps) {
  return <StatusBadge className={cn("ce-status-pill", className)} {...props} />;
}
