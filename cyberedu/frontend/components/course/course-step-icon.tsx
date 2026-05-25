import { Check, Lock, type LucideIcon } from "lucide-react";
import {
  COURSE_STEP_ICON_CONFIG,
  type CourseStepIconKind,
  type CourseStepIconStatus,
} from "@/lib/course-step-icons";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "size-9 [&_svg]:size-4",
  md: "size-11 [&_svg]:size-5",
  lg: "size-12 [&_svg]:size-5",
} as const;

const STATUS_CLASS: Record<CourseStepIconStatus, string> = {
  completed: "ce-course-step-icon--completed",
  in_progress: "ce-course-step-icon--in-progress",
  available: "ce-course-step-icon--available",
  locked: "ce-course-step-icon--locked",
  pending_review: "ce-course-step-icon--pending",
  needs_retry: "ce-course-step-icon--retry",
  not_started: "",
};

export function CourseStepIcon({
  kind,
  size = "md",
  status,
  className,
  iconClassName,
}: {
  kind: CourseStepIconKind;
  size?: keyof typeof SIZE_CLASS;
  status?: CourseStepIconStatus;
  className?: string;
  iconClassName?: string;
}) {
  const { Icon, accent, label } = COURSE_STEP_ICON_CONFIG[kind];
  const showCheck = status === "completed";
  const showLock = status === "locked";
  const Glyph: LucideIcon = showCheck ? Check : showLock ? Lock : Icon;

  return (
    <span
      className={cn(
        "ce-course-step-icon",
        `ce-course-step-icon--${accent}`,
        SIZE_CLASS[size],
        status ? STATUS_CLASS[status] : null,
        className,
      )}
      role="img"
      aria-label={label}
    >
      <Glyph
        className={cn("shrink-0", showCheck && "stroke-[2.5]", iconClassName)}
        strokeWidth={showCheck ? undefined : 1.75}
        aria-hidden
      />
    </span>
  );
}
