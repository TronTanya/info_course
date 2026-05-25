import { Check, Lock } from "lucide-react";
import { getCourseStatusNodeClass } from "@/lib/course-ui-status";
import type { CourseEntityUiStatus } from "@/types/course-ui-status";
import { cn } from "@/lib/utils";

/**
 * Узел модуля на карте курса (номер / замок / галочка) в cyber-стиле.
 */
export function CourseModuleNodeIcon({
  orderNumber,
  status,
  isFocus = false,
  className,
}: {
  orderNumber: number;
  status: CourseEntityUiStatus;
  isFocus?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ce-course-module-node relative flex shrink-0 items-center justify-center rounded-2xl border-2 font-mono text-sm font-bold tabular-nums",
        "size-11 sm:size-12",
        getCourseStatusNodeClass(status, isFocus),
        isFocus && "ring-2 ring-primary/35 ring-offset-2 ring-offset-background",
        className,
      )}
      aria-hidden
    >
      {status === "completed" ? (
        <Check className="size-5 stroke-[2.5]" />
      ) : status === "locked" ? (
        <Lock className="size-4" strokeWidth={1.75} />
      ) : (
        <span>{orderNumber}</span>
      )}
      {status === "completed" ? (
        <span className="ce-course-module-node__pulse absolute inset-0 rounded-2xl" aria-hidden />
      ) : null}
    </div>
  );
}
