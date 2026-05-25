import type { ProgressGate } from "@/lib/course-progress-guards";
import {
  buildPracticeNextLearningStep,
  type PracticePageLearningContext,
} from "@/lib/practice-next-learning-step";
import type { PracticeMentorQuickActionId } from "@/lib/practice-mentor-panel";
import type { PracticeNextStepType, PracticeViewStatus } from "@/types/practice-view-model";

export type PracticeNextStepActionKind = PracticeNextStepType | "revise" | "mentor";

export type PracticeNextStepAction = {
  id: string;
  title: string;
  variant: "primary" | "secondary" | "outline";
  type: PracticeNextStepActionKind;
  href?: string;
  hint?: string;
  scrollToId?: string;
  mentorActionId?: PracticeMentorQuickActionId;
};

export type PracticeNextStepsPanel = {
  headline: string;
  description: string;
  actions: PracticeNextStepAction[];
};

export const PRACTICE_NEXT_STEP_WORKSPACE_ID = "practice-workspace";

function typeFromHref(href: string): PracticeNextStepType {
  if (href.includes("/certificate")) return "certificate";
  if (href.includes("/practice")) return "practice";
  if (href.includes("/test")) return "test";
  if (href.includes("/lesson")) return "lesson";
  return "course";
}

function requireLearning(ctx: PracticePageLearningContext | undefined): PracticePageLearningContext | null {
  if (!ctx?.moduleId) return null;
  return ctx;
}

function buildApprovedPanel(learning: PracticePageLearningContext): PracticeNextStepsPanel | null {
  const step = buildPracticeNextLearningStep(learning, true);
  if (!step) return null;

  const actions: PracticeNextStepAction[] = [
    {
      id: "primary",
      title: step.primaryCta.label,
      href: step.primaryCta.href,
      type: typeFromHref(step.primaryCta.href),
      variant: "primary",
      hint: step.primaryCta.hint,
    },
  ];

  if (step.certificateCta) {
    actions.push({
      id: "certificate",
      title: step.certificateCta.label,
      href: step.certificateCta.href,
      type: "certificate",
      variant: step.secondaryCta ? "outline" : "secondary",
      hint: step.certificateCta.hint,
    });
  }

  if (step.secondaryCta) {
    actions.push({
      id: "secondary",
      title: step.secondaryCta.label,
      href: step.secondaryCta.href,
      type: typeFromHref(step.secondaryCta.href),
      variant: "secondary",
      hint: step.secondaryCta.hint,
    });
  }

  return {
    headline: step.headline,
    description: step.description,
    actions,
  };
}

function buildPendingReviewPanel(learning: PracticePageLearningContext): PracticeNextStepsPanel {
  return {
    headline: "Работа на проверке",
    description:
      "Преподаватель проверяет отправку. Редактирование недоступно — вернитесь к курсу и загляните сюда позже.",
    actions: [
      {
        id: "course",
        title: "Вернуться к курсу",
        href: learning.courseHref,
        type: "course",
        variant: "primary",
        hint: learning.courseTitle,
      },
      {
        id: "module-status",
        title: "Обзор модуля",
        href: learning.moduleHref,
        type: "course",
        variant: "secondary",
        hint: "Статус практики обновится после решения проверяющего",
      },
    ],
  };
}

function buildNeedsRetryPanel(
  learning: PracticePageLearningContext,
  canRetry: boolean,
  workspaceAnchorId: string,
): PracticeNextStepsPanel {
  const actions: PracticeNextStepAction[] = [];

  if (canRetry) {
    actions.push({
      id: "revise",
      title: "Доработать практику",
      type: "revise",
      variant: "primary",
      scrollToId: workspaceAnchorId,
      hint: "Форма ответа ниже на этой странице",
    });
  }

  actions.push({
    id: "lesson",
    title: "Повторить связанный урок",
    href: learning.lessonHref,
    type: "lesson",
    variant: canRetry ? "secondary" : "primary",
  });

  actions.push({
    id: "mentor",
    title: "AI-подсказка",
    type: "mentor",
    variant: "outline",
    mentorActionId: "hint_no_answer",
    hint: "Без готового решения",
  });

  return {
    headline: "Нужно доработать",
    description: canRetry
      ? "Учтите комментарий проверяющего, обновите ответ и отправьте снова."
      : "Повторная отправка сейчас недоступна — уточните материалы модуля.",
    actions,
  };
}

function buildLockedUnlockAction(
  gate: ProgressGate,
  learning: PracticePageLearningContext,
): PracticeNextStepAction {
  if (gate.ok) {
    return {
      id: "course",
      title: "К карте курса",
      href: learning.courseHref,
      type: "course",
      variant: "primary",
    };
  }

  switch (gate.code) {
    case "TEST":
      return {
        id: "test",
        title: "Перейти к тесту",
        href: learning.testHref,
        type: "test",
        variant: "primary",
        hint: gate.message,
      };
    case "LESSON":
    case "VIDEO":
      return {
        id: "lesson",
        title: "Перейти к лекции",
        href: learning.lessonHref,
        type: "lesson",
        variant: "primary",
        hint: gate.message,
      };
    case "MODULE_LOCKED":
    case "MODULE_INACTIVE":
    default:
      return {
        id: "course",
        title: "К карте курса",
        href: learning.courseHref,
        type: "course",
        variant: "primary",
        hint: gate.message,
      };
  }
}

function buildLockedPanel(gate: ProgressGate, learning: PracticePageLearningContext): PracticeNextStepsPanel {
  const unlock = buildLockedUnlockAction(gate, learning);
  return {
    headline: "Практика заблокирована",
    description: gate.ok
      ? "Сначала выполните предыдущие шаги модуля."
      : (gate.message ?? "Сначала выполните предыдущие шаги."),
    actions: [
      unlock,
      {
        id: "module-hub",
        title: "Обзор модуля",
        href: learning.moduleHref,
        type: "course",
        variant: "secondary",
      },
    ],
  };
}

/** Панель «Следующий шаг» по статусу практики (ETAP 16). Только существующие маршруты. */
export function buildPracticeNextStepsPanel(input: {
  status: PracticeViewStatus;
  learning?: PracticePageLearningContext;
  practiceGate: ProgressGate;
  canRetry?: boolean;
  workspaceAnchorId?: string;
}): PracticeNextStepsPanel | null {
  const learning = requireLearning(input.learning);
  const workspaceId = input.workspaceAnchorId ?? PRACTICE_NEXT_STEP_WORKSPACE_ID;

  if (input.status === "locked") {
    if (!learning) return null;
    return buildLockedPanel(input.practiceGate, learning);
  }

  if (!learning) return null;

  switch (input.status) {
    case "approved":
      return buildApprovedPanel(learning);
    case "pending_review":
    case "submitted":
      return buildPendingReviewPanel(learning);
    case "needs_retry":
    case "rejected":
      return buildNeedsRetryPanel(learning, Boolean(input.canRetry), workspaceId);
    default:
      return null;
  }
}

export function practiceNextStepsPanelVisible(status: PracticeViewStatus): boolean {
  return (
    status === "approved" ||
    status === "pending_review" ||
    status === "submitted" ||
    status === "needs_retry" ||
    status === "rejected" ||
    status === "locked"
  );
}

/** Первичный CTA для шапки лаборатории (обратная совместимость). */
export function primaryPracticeNextStepFromPanel(
  panel: PracticeNextStepsPanel | null | undefined,
): { title: string; href: string; type: PracticeNextStepType } | undefined {
  const action = panel?.actions.find((a) => a.variant === "primary" && a.href);
  if (!action?.href) return undefined;
  return {
    title: action.title,
    href: action.href,
    type: action.type === "revise" || action.type === "mentor" ? "practice" : action.type,
  };
}
