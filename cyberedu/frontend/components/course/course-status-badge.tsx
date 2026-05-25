import { AlertCircle, Check, Clock, Lock } from "lucide-react";
import type { CourseEntityUiStatus, CourseRoadmapFocusStatus } from "@/types/course-ui-status";
import { getStatusBadgeConfig } from "@/lib/course-ui-status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CourseStatusBadge({
  status,
  className,
  labelOverride,
}: {
  status: CourseEntityUiStatus | "current";
  className?: string;
  labelOverride?: string;
}) {
  const config = getStatusBadgeConfig(status);

  return (
    <Badge variant={config.variant} className={cn("gap-1", config.className, className)}>
      {status === "locked" ? <Lock className="size-3" aria-hidden /> : null}
      {status === "completed" ? <Check className="size-3" aria-hidden /> : null}
      {status === "pending_review" ? <Clock className="size-3" aria-hidden /> : null}
      {status === "needs_retry" ? <AlertCircle className="size-3" aria-hidden /> : null}
      <span>{labelOverride ?? config.label}</span>
    </Badge>
  );
}

export function CourseStatusFocusBadge({ className }: { className?: string }) {
  return <CourseStatusBadge status="current" className={className} labelOverride="Вы здесь" />;
}

export type { CourseRoadmapFocusStatus };
