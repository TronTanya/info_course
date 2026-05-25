import { LESSON_HEADER_STATUS_LABELS } from "@/lib/lesson-header-ui";
import { lessonLinkDisabledReason, lessonLinkTitle, type LessonLink, type LessonStatus } from "@/types/lesson-view-model";

export type LessonCompletionNextPreview = {
  id: string;
  label: string;
  description: string;
  available: boolean;
};

export const LESSON_COMPLETION_SUCCESS_DEFAULT =
  "Прогресс сохранён на сервере. Можно перейти к тесту или следующему уроку.";

export function lessonStatusLabel(status: LessonStatus): string {
  return LESSON_HEADER_STATUS_LABELS[status] ?? "Урок";
}

export function isLessonCompletionLocked(status: LessonStatus): boolean {
  return status === "locked";
}

export function canShowLessonMarkComplete(input: {
  lessonStatus: LessonStatus;
  lessonCompleted: boolean;
  canMarkComplete: boolean;
  markPending: boolean;
}): boolean {
  if (input.lessonCompleted || input.markPending) return false;
  if (isLessonCompletionLocked(input.lessonStatus)) return false;
  return input.canMarkComplete;
}

export function lessonCompletionHeadline(lessonCompleted: boolean, lessonStatus: LessonStatus): string {
  if (lessonCompleted) return "Урок пройден";
  if (isLessonCompletionLocked(lessonStatus)) return "Урок заблокирован";
  return "Завершите урок";
}

export function lessonCompletionDescription(
  lessonCompleted: boolean,
  lessonStatus: LessonStatus,
  lockedReason?: string | null,
): string {
  if (lessonCompleted) {
    return "Прогресс сохранён на сервере. Выберите следующий шаг модуля.";
  }
  if (isLessonCompletionLocked(lessonStatus)) {
    return (
      lockedReason?.trim() ||
      "Сначала завершите предыдущие шаги модуля — затем станет доступно завершение этого урока."
    );
  }
  return "Нажмите «Завершить урок» — прогресс сохранится через Server Action на сервере.";
}

export function buildLessonCompletionNextSteps(input: {
  courseTitle: string;
  nextLesson?: LessonLink | null;
  nextTest?: LessonLink | null;
  nextPractice?: LessonLink | null;
  hasTest: boolean;
  hasPractice: boolean;
  canAccessTest: boolean;
  canAccessPractice: boolean;
  lessonCompleted: boolean;
  lessonStatus?: LessonStatus;
}): LessonCompletionNextPreview[] {
  const locked = input.lessonStatus ? isLessonCompletionLocked(input.lessonStatus) : false;
  const steps: LessonCompletionNextPreview[] = [];

  if (input.nextLesson?.href.includes("/lesson")) {
    steps.push({
      id: "next-lesson",
      label: "Следующий урок",
      description: lessonLinkDisabledReason(input.nextLesson) ?? lessonLinkTitle(input.nextLesson),
      available: !locked && !input.nextLesson.disabled,
    });
  }

  if (input.hasTest) {
    steps.push({
      id: "test",
      label: "Контрольный тест",
      description: (input.nextTest ? lessonLinkDisabledReason(input.nextTest) : undefined) ?? "Проверка знаний по модулю",
      available: !locked && input.canAccessTest && !input.nextTest?.disabled,
    });
  }

  if (input.hasPractice) {
    steps.push({
      id: "practice",
      label: "Практика",
      description:
        (input.nextPractice ? lessonLinkDisabledReason(input.nextPractice) : undefined) ??
        "Лабораторный сценарий модуля",
      available: !locked && input.canAccessPractice && !input.nextPractice?.disabled,
    });
  }

  steps.push({
    id: "course",
    label: "Курс",
    description: input.courseTitle,
    available: true,
  });

  if (!input.lessonCompleted && !locked && steps.length > 0) {
    return steps.map((s) =>
      s.id === "course" ? s : { ...s, available: s.id === "course" ? true : false },
    );
  }

  return steps;
}
