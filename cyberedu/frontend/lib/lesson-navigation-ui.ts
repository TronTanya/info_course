import type { LearningNavModuleItem } from "@/lib/learning-nav";
import type { ModuleHubStepView } from "@/lib/module-hub-steps";
import { lessonLinkDisabledReason, lessonLinkTitle, type LessonLink } from "@/types/lesson-view-model";

export const LESSON_NAV_LOCK_MESSAGES = {
  TEST_NEEDS_LESSONS: "Завершите уроки модуля, чтобы открыть тест.",
  PRACTICE_NEEDS_TEST: "Сначала сдайте тест модуля.",
} as const;

export const LESSON_NAV_CERTIFICATE_HREF = "/dashboard/certificate";

export type LessonNavItemKind =
  | "current-lesson"
  | "previous-lesson"
  | "next-lesson"
  | "test"
  | "practice"
  | "next-module"
  | "certificate"
  | "roadmap";

export type LessonNavItem = {
  kind: LessonNavItemKind;
  title: string;
  description: string;
  href?: string;
  disabled: boolean;
  lockReason?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
  isHighlightedNext?: boolean;
};

export type BuildLessonNavigationItemsInput = {
  lessonTitle: string;
  lessonCompleted: boolean;
  courseHref: string;
  courseTitle: string;
  currentModuleId?: string;
  courseModules?: LearningNavModuleItem[];
  previousLesson?: LessonLink | null;
  nextLesson?: LessonLink | null;
  nextTest?: LessonLink | null;
  nextPractice?: LessonLink | null;
  hasTest: boolean;
  hasPractice: boolean;
  canAccessTest: boolean;
  canAccessPractice: boolean;
  hubSteps?: ModuleHubStepView[];
};

function isLessonHref(link: LessonLink | null | undefined): link is LessonLink {
  return Boolean(link?.href.includes("/lesson"));
}

function hubStepStatus(steps: ModuleHubStepView[] | undefined, kind: ModuleHubStepView["kind"]) {
  return steps?.find((s) => s.kind === kind)?.status;
}

export function resolveNextCourseModule(
  modules: LearningNavModuleItem[] | undefined,
  currentModuleId: string | undefined,
): LessonLink | null {
  if (!modules?.length || !currentModuleId) return null;
  const current = modules.find((m) => m.id === currentModuleId || m.isCurrent);
  const currentOrder = current?.orderNumber ?? 0;
  const candidate = modules.find(
    (m) => m.id !== currentModuleId && m.orderNumber > currentOrder && m.unlocked && !m.isCurrent,
  );
  if (!candidate) return null;
  return {
    title: `Модуль ${candidate.orderNumber}: ${candidate.title}`,
    href: candidate.href,
    disabled: false,
  };
}

export function isCurrentModuleFullyComplete(input: BuildLessonNavigationItemsInput): boolean {
  if (!input.lessonCompleted) return false;
  if (input.hasTest && hubStepStatus(input.hubSteps, "test") !== "completed") return false;
  if (input.hasPractice && hubStepStatus(input.hubSteps, "practice") !== "completed") return false;
  const nextLessonOpen = input.nextLesson && !input.nextLesson.disabled;
  if (nextLessonOpen) return false;
  return true;
}

function resolveTestLockReason(input: BuildLessonNavigationItemsInput): string | undefined {
  if (input.canAccessTest && !input.nextTest?.disabled) return undefined;
  if (!input.lessonCompleted || !input.canAccessTest) {
    return LESSON_NAV_LOCK_MESSAGES.TEST_NEEDS_LESSONS;
  }
  if (!input.nextTest) return LESSON_NAV_LOCK_MESSAGES.TEST_NEEDS_LESSONS;
  return lessonLinkDisabledReason(input.nextTest) ?? LESSON_NAV_LOCK_MESSAGES.TEST_NEEDS_LESSONS;
}

function resolvePracticeLockReason(input: BuildLessonNavigationItemsInput): string | undefined {
  if (input.canAccessPractice && !input.nextPractice?.disabled) return undefined;
  return (
    (input.nextPractice ? lessonLinkDisabledReason(input.nextPractice) : undefined) ??
    (!input.canAccessPractice ? LESSON_NAV_LOCK_MESSAGES.PRACTICE_NEEDS_TEST : undefined)
  );
}

function pickHighlightedNextKind(input: BuildLessonNavigationItemsInput): LessonNavItemKind | null {
  if (isCurrentModuleFullyComplete(input)) {
    const nextMod = resolveNextCourseModule(input.courseModules, input.currentModuleId);
    if (nextMod) return "next-module";
    return "certificate";
  }
  if (!input.lessonCompleted) return null;
  if (input.nextLesson && !input.nextLesson.disabled) return "next-lesson";
  if (input.hasTest && input.canAccessTest && !input.nextTest?.disabled) return "test";
  if (input.hasPractice && input.canAccessPractice && !input.nextPractice?.disabled) return "practice";
  return null;
}

export function buildLessonNavigationItems(input: BuildLessonNavigationItemsInput): LessonNavItem[] {
  const items: LessonNavItem[] = [];
  const highlighted = pickHighlightedNextKind(input);
  const testCompleted = hubStepStatus(input.hubSteps, "test") === "completed";
  const practiceCompleted = hubStepStatus(input.hubSteps, "practice") === "completed";
  const moduleComplete = isCurrentModuleFullyComplete(input);

  items.push({
    kind: "current-lesson",
    title: "Текущий урок",
    description: input.lessonTitle,
    disabled: true,
    isCurrent: true,
  });

  if (isLessonHref(input.previousLesson)) {
    const prev = input.previousLesson;
    items.push({
      kind: "previous-lesson",
      title: lessonLinkTitle(prev) || "Предыдущий урок",
      description: lessonLinkDisabledReason(prev) ?? "Вернуться к предыдущему материалу",
      href: prev.disabled ? undefined : prev.href,
      disabled: Boolean(prev.disabled),
      lockReason: prev.disabled ? lessonLinkDisabledReason(prev) : undefined,
    });
  }

  if (input.nextLesson) {
    const next = input.nextLesson;
    items.push({
      kind: "next-lesson",
      title: lessonLinkTitle(next) || "Следующий урок",
      description: lessonLinkDisabledReason(next) ?? "Продолжить курс",
      href: next.disabled ? undefined : next.href,
      disabled: Boolean(next.disabled),
      lockReason: next.disabled ? lessonLinkDisabledReason(next) : undefined,
      isHighlightedNext: highlighted === "next-lesson",
    });
  }

  if (input.hasTest) {
    const testDisabled = !input.canAccessTest || Boolean(input.nextTest?.disabled);
    const lockReason = resolveTestLockReason(input);
    items.push({
      kind: "test",
      title: input.nextTest ? lessonLinkTitle(input.nextTest) : "Тест модуля",
      description:
        (input.nextTest ? lessonLinkDisabledReason(input.nextTest) : undefined) ??
        "Контрольные вопросы модуля",
      href: testDisabled ? undefined : input.nextTest?.href,
      disabled: testDisabled,
      lockReason: testDisabled ? lockReason : undefined,
      isHighlightedNext: highlighted === "test",
      isCompleted: testCompleted,
    });
  }

  if (input.hasPractice) {
    const practiceDisabled = !input.canAccessPractice || Boolean(input.nextPractice?.disabled);
    const lockReason = resolvePracticeLockReason(input);
    items.push({
      kind: "practice",
      title: input.nextPractice ? lessonLinkTitle(input.nextPractice) : "Практика модуля",
      description:
        (input.nextPractice ? lessonLinkDisabledReason(input.nextPractice) : undefined) ??
        "Лабораторный сценарий",
      href: practiceDisabled ? undefined : input.nextPractice?.href,
      disabled: practiceDisabled,
      lockReason: practiceDisabled ? lockReason : undefined,
      isHighlightedNext: highlighted === "practice",
      isCompleted: practiceCompleted,
    });
  }

  if (moduleComplete) {
    const nextMod = resolveNextCourseModule(input.courseModules, input.currentModuleId);
    if (nextMod) {
      items.push({
        kind: "next-module",
        title: lessonLinkTitle(nextMod) || "Следующий модуль",
        description: "Модуль разблокирован — продолжайте курс",
        href: nextMod.href,
        disabled: false,
        isHighlightedNext: highlighted === "next-module",
      });
    }
    items.push({
      kind: "certificate",
      title: "Сертификат",
      description: moduleComplete && !nextMod
        ? "Оформите сертификат по завершении всего курса"
        : "Доступен после прохождения всех модулей",
      href: LESSON_NAV_CERTIFICATE_HREF,
      disabled: false,
      isHighlightedNext: highlighted === "certificate",
    });
  }

  items.push({
    kind: "roadmap",
    title: "Назад к карте курса",
    description: input.courseTitle,
    href: input.courseHref,
    disabled: false,
  });

  return items;
}
