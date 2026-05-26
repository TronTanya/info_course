import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export type InProgressBadgeProps = {
  label?: string;
  className?: string;
};

export function InProgressBadge({ label = "В процессе", className }: InProgressBadgeProps) {
  return (
    <StatusBadge
      status="in_progress"
      label={label}
      className={cn("font-mono text-2.5 uppercase tracking-wider", className)}
    />
  );
}
