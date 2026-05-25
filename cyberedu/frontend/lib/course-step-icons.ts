import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  CirclePlay,
  Layers,
  ScrollText,
  Target,
  Terminal,
  Trophy,
} from "lucide-react";

/** Типы шагов курса / модуля для единых иконок. */
export type CourseStepIconKind =
  | "lesson"
  | "lecture"
  | "video"
  | "test"
  | "practice"
  | "module"
  | "certificate"
  | "result";

export type CourseStepIconAccent = "cyan" | "primary" | "accent" | "success" | "warning" | "muted";

export type CourseStepIconStatus =
  | "completed"
  | "in_progress"
  | "available"
  | "locked"
  | "pending_review"
  | "needs_retry"
  | "not_started";

export type CourseStepIconConfig = {
  Icon: LucideIcon;
  accent: CourseStepIconAccent;
  /** Короткая подпись для aria / tooltip */
  label: string;
};

export const COURSE_STEP_ICON_CONFIG: Record<CourseStepIconKind, CourseStepIconConfig> = {
  lesson: { Icon: BookOpen, accent: "cyan", label: "Урок" },
  lecture: { Icon: ScrollText, accent: "cyan", label: "Лекция" },
  video: { Icon: CirclePlay, accent: "primary", label: "Видео" },
  test: { Icon: Target, accent: "primary", label: "Тест" },
  practice: { Icon: Terminal, accent: "accent", label: "Практика" },
  module: { Icon: Layers, accent: "primary", label: "Модуль" },
  certificate: { Icon: Award, accent: "success", label: "Сертификат" },
  result: { Icon: Trophy, accent: "success", label: "Результат" },
};

/** Маппинг внутренних kind roadmap → иконка. */
export const ROADMAP_STEP_ICON_KIND = {
  lesson: "lesson",
  test: "test",
  practice: "practice",
} as const satisfies Record<string, CourseStepIconKind>;
