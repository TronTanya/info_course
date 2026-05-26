import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export type CompletedBadgeProps = {
  label?: string;
  className?: string;
};

export function CompletedBadge({ label = "Завершён", className }: CompletedBadgeProps) {
  return (
    <StatusBadge
      status="completed"
      label={label}
      className={cn("font-mono text-2.5 uppercase tracking-wider", className)}
    />
  );
}
