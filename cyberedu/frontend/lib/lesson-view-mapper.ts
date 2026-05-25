import { extractLessonGlossary, parseLessonStructure } from "@/components/lesson/lesson-structured-text";
import type { LearningPageContext } from "@/lib/learning-context";
import type { LearningStepLink } from "@/lib/learning-nav";
import { buildLessonCheckpoints } from "@/lib/lesson-checkpoints";
import { resolveLessonKeyTerms } from "@/lib/lesson-key-terms";
import {
  extractKeyIdeas,
  extractLessonGoal,
  extractRememberBlock,
} from "@/lib/lesson-page-ui";
import type { ModuleHubStepView } from "@/lib/module-hub-steps";
import {
  estimateLessonReadingMinutes,
  formatLessonReadingTime,
} from "@/lib/module-content-list";
import type {
  CheckpointOption,
  CheckpointQuestion,
  KeyTerm,
  LessonLink,
  LessonObjective,
  LessonStatus,
  LessonViewModel,
} from "@/types/lesson-view-model";

export type {
  LessonViewModel,
  LessonStatus,
  KeyTerm,
  LessonObjective,
  CheckpointQuestion,
  CheckpointOption,
  LessonLink,
  /** @deprecated Use LessonLink */
  LessonLink as LessonNavLink,
};

export type LessonViewAccessFlags = {
  /** Сервер: модуль разблокирован и лекция ещё не отмечена */
  canMarkComplete: boolean;
  /** Сервер: результат `checkTestPrerequisites` */
  canAccessTest: boolean;
  /** Сервер: результат `checkPracticeEntry` */
  canAccessPractice: boolean;
};

export type BuildLessonViewModelInput = {
  moduleId: string;
  lesson: {
    id: string;
    title: string;
    content: string;
  };
  hasVideo?: boolean;
  moduleTitle: string;
  moduleOrderNumber: number;
  /** Порядок лекции в модуле (сейчас обычно 1) */
  lessonOrderInModule?: number;
  moduleUnlocked: boolean;
  lessonCompleted: boolean;
  /** Есть запись Progress по модулю (признак «уже заходил») */
  hasProgressRow: boolean;
  learning: LearningPageContext;
  access: LessonViewAccessFlags;
  /** Подсказка при status === locked (с сервера, не с клиента). */
  lockedReason?: string | null;
};

function learningLinkToLesson(link: LearningStepLink | null): LessonLink | null {
  if (!link) return null;
  const disabled = Boolean(link.disabled);
  return {
    title: link.label,
    href: link.href,
    disabled,
    disabledReason: disabled ? link.hint : undefined,
  };
}

function hubStepToLessonLink(step: ModuleHubStepView | undefined): LessonLink | null {
  if (!step?.actionHref) return null;
  const disabled = step.status === "blocked";
  return {
    title: step.title,
    href: step.actionHref,
    status: step.status,
    disabled,
    disabledReason: disabled ? step.description : undefined,
  };
}

function findHubStep(steps: ModuleHubStepView[], kind: ModuleHubStepView["kind"]): ModuleHubStepView | undefined {
  return steps.find((s) => s.kind === kind);
}

export function resolveLessonStatus(input: {
  moduleUnlocked: boolean;
  lectureBlocked: boolean;
  lessonCompleted: boolean;
  hasProgressRow: boolean;
}): LessonStatus {
  if (!input.moduleUnlocked || input.lectureBlocked) return "locked";
  if (input.lessonCompleted) return "completed";
  if (!input.hasProgressRow) return "not_started";
  return "in_progress";
}

/** Цели урока из структуры контента + fallback без выдуманных фактов */
export function extractLessonObjectives(content: string, max = 6): LessonObjective[] {
  const segments = parseLessonStructure(content);
  const lines: string[] = [];

  const goal = extractLessonGoal(content);
  if (goal) lines.push(goal);

  for (const seg of segments) {
    if (seg.type === "why" && seg.body.trim()) {
      const t = seg.body.trim();
      if (!lines.some((l) => l === t)) lines.push(t);
    }
    if (seg.type === "outro") {
      if (seg.title && !["Итог", "Запомни"].includes(seg.title)) lines.push(seg.title);
      for (const line of seg.body.split("\n").map((l) => l.replace(/^[-*•]\s+/, "").trim()).filter(Boolean)) {
        lines.push(line);
      }
    }
  }

  const remember = extractRememberBlock(content);
  if (remember) {
    for (const item of remember.items.slice(0, 3)) {
      lines.push(item);
    }
  }

  for (const idea of extractKeyIdeas(content, max)) {
    lines.push(idea);
  }

  const unique: LessonObjective[] = [];
  const seen = new Set<string>();
  for (const text of lines) {
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    unique.push({ text });
    if (unique.length >= max) break;
  }

  return unique;
}

export function extractLessonKeyTerms(content: string, max = 8): KeyTerm[] {
  const fromGlossary = extractLessonGlossary(content);
  const terms: KeyTerm[] = [];
  const seen = new Set<string>();

  for (const entry of fromGlossary) {
    const key = entry.term.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    terms.push({
      term: entry.term.trim(),
      definition: entry.description.trim() || "—",
    });
    if (terms.length >= max) break;
  }

  if (terms.length > 0) return terms;

  for (const idea of extractKeyIdeas(content, 4)) {
    const dash = /\s[—–-]\s/.exec(idea);
    if (dash && dash.index !== undefined && dash.index > 0) {
      const term = idea.slice(0, dash.index).trim();
      const definition = idea.slice(dash.index + dash[0].length).trim();
      const key = term.toLowerCase();
      if (term && !seen.has(key)) {
        seen.add(key);
        terms.push({ term, definition: definition || "—" });
      }
    }
  }

  return terms;
}

function resolveLessonNav(
  learning: LearningPageContext,
  moduleId: string,
): Pick<LessonViewModel, "previousLesson" | "nextLesson" | "nextTest" | "nextPractice"> {
  const hubSteps = learning.steps;
  const prefix = `/dashboard/course/${moduleId}`;

  const previous = learningLinkToLesson(learning.neighbors.previous);
  const nextRaw = learning.neighbors.next;
  const nextLesson =
    nextRaw && nextRaw.href.includes("/lesson") && !nextRaw.disabled ? learningLinkToLesson(nextRaw) : null;

  const testStep = findHubStep(hubSteps, "test");
  const practiceStep = findHubStep(hubSteps, "practice");
  const testBlocked = testStep?.status === "blocked";
  const practiceBlocked = practiceStep?.status === "blocked";

  return {
    previousLesson: previous,
    nextLesson,
    nextTest: hubStepToLessonLink(testStep) ?? {
      title: "Тест",
      href: `${prefix}/test`,
      status: testStep?.status,
      disabled: testBlocked,
      disabledReason: testBlocked ? testStep?.description : undefined,
    },
    nextPractice: hubStepToLessonLink(practiceStep) ?? {
      title: "Практика",
      href: `${prefix}/practice`,
      status: practiceStep?.status,
      disabled: practiceBlocked,
      disabledReason: practiceBlocked ? practiceStep?.description : undefined,
    },
  };
}

export function formatLessonEstimatedTime(minutes: number, hasVideo: boolean): string {
  return formatLessonReadingTime(minutes, hasVideo);
}

export { buildLessonHeaderStatus, lessonStatusPresentation } from "@/lib/lesson-header-ui";

export function buildLessonViewModel(input: BuildLessonViewModelInput): LessonViewModel {
  const { lesson, learning, access } = input;
  const content = lesson.content;
  const description = extractLessonGoal(content);
  const lectureStep = findHubStep(learning.steps, "lecture");

  const status = resolveLessonStatus({
    moduleUnlocked: input.moduleUnlocked,
    lectureBlocked: lectureStep?.status === "blocked",
    lessonCompleted: input.lessonCompleted,
    hasProgressRow: input.hasProgressRow,
  });

  const nav = resolveLessonNav(learning, input.moduleId);

  const lockedReason =
    status === "locked"
      ? (input.lockedReason?.trim() || lectureStep?.description || undefined)
      : undefined;

  return {
    id: lesson.id,
    title: lesson.title,
    description: description ?? undefined,
    content,
    moduleId: input.moduleId,
    moduleTitle: input.moduleTitle,
    moduleNumber: input.moduleOrderNumber,
    lessonNumber: input.lessonOrderInModule ?? 1,
    estimatedMinutes: estimateLessonReadingMinutes(content.length, Boolean(input.hasVideo)),
    status,
    objectives: extractLessonObjectives(content),
    keyTerms: resolveLessonKeyTerms(
      extractLessonKeyTerms(content),
      content,
      input.lesson.title,
    ),
    checkpoints: buildLessonCheckpoints(content, lesson.id),
    ...nav,
    canMarkComplete: access.canMarkComplete,
    canAccessTest: access.canAccessTest,
    canAccessPractice: access.canAccessPractice,
    lockedReason,
  };
}
