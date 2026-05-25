import type { Metadata } from "next";
import { checkModuleAccessForApi, checkPracticeEntry } from "@/lib/course-progress-guards";
import { DASHBOARD_LESSON_ROBOTS } from "@/lib/lesson-page-metadata";
import { prisma } from "@/lib/db";

const DEFAULT_PRACTICE_TITLE = "Кибер-лаборатория — CyberEdu";

const DEFAULT_PRACTICE_DESCRIPTION =
  "Практическая лаборатория на платформе CyberEdu. Доступна после входа в личный кабинет.";

const META_TITLE_MAX = 80;
const META_MODULE_MAX = 72;

/** Публичный сниппет: только название, без сценария, evidence и разметки. */
export function sanitizePracticeMetaLabel(raw: string, maxLen: number): string {
  const cleaned = raw.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxLen) return cleaned;
  const slice = cleaned.slice(0, maxLen - 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 16 ? slice.slice(0, lastSpace) : slice;
  return `${base}…`;
}

export function buildPracticeMetaDescription(moduleTitle: string): string {
  const moduleLabel = sanitizePracticeMetaLabel(moduleTitle, META_MODULE_MAX);
  if (!moduleLabel) return DEFAULT_PRACTICE_DESCRIPTION;
  return `Практическая лаборатория по модулю ${moduleLabel}.`;
}

/**
 * Заголовок вкладки: одно задание — его title; несколько — общее имя лаборатории.
 * Не использует scenarioData, description, evidence и ответы.
 */
export function resolvePracticeMetaTitle(tasks: { title: string | null }[]): string {
  const titles = tasks
    .map((t) => (t.title?.trim() ? sanitizePracticeMetaLabel(t.title.trim(), META_TITLE_MAX) : ""))
    .filter(Boolean);
  if (titles.length === 1) return titles[0]!;
  if (titles.length > 1) return "Кибер-лаборатория";
  return "";
}

export type BuildPracticePageMetadataInput = {
  moduleActive: boolean;
  /**
   * Разрешено ли показывать название практики и модуля в meta.
   * false для гостей, закрытых модулей и до открытия практики — без утечек в SEO.
   */
  canExposePracticeDetails?: boolean;
  practiceTitle?: string | null;
  moduleTitle?: string | null;
};

function privatePracticeMetadata(): Metadata {
  return {
    title: { absolute: DEFAULT_PRACTICE_TITLE },
    description: DEFAULT_PRACTICE_DESCRIPTION,
    robots: DASHBOARD_LESSON_ROBOTS,
  };
}

/** Синхронная сборка metadata (без сценария, evidence и персональных данных). */
export function buildPracticePageMetadataFromInput(input: BuildPracticePageMetadataInput): Metadata {
  const canExpose =
    input.moduleActive &&
    input.canExposePracticeDetails === true &&
    Boolean(input.practiceTitle?.trim()) &&
    Boolean(input.moduleTitle?.trim());

  if (!canExpose) {
    return privatePracticeMetadata();
  }

  const practiceTitle = sanitizePracticeMetaLabel(input.practiceTitle!.trim(), META_TITLE_MAX);
  const moduleTitle = sanitizePracticeMetaLabel(input.moduleTitle!.trim(), META_MODULE_MAX);

  if (!practiceTitle || !moduleTitle) {
    return privatePracticeMetadata();
  }

  return {
    title: { absolute: `${practiceTitle} — CyberEdu` },
    description: buildPracticeMetaDescription(moduleTitle),
    robots: DASHBOARD_LESSON_ROBOTS,
  };
}

/**
 * Metadata страницы практики: только название задания(й) и модуля при доступе студента.
 * Сценарий, evidence, rubric, ответы и данные пользователя не загружаются.
 */
export async function buildPracticePageMetadata(
  moduleId: string,
  userId: string | undefined,
): Promise<Metadata> {
  if (!userId) {
    return buildPracticePageMetadataFromInput({ moduleActive: false });
  }

  const access = await checkModuleAccessForApi(userId, moduleId);
  if (!access.ok) {
    return buildPracticePageMetadataFromInput({ moduleActive: false });
  }

  const practiceGate = await checkPracticeEntry(userId, moduleId);
  if (!practiceGate.ok) {
    return buildPracticePageMetadataFromInput({ moduleActive: false });
  }

  const [mod, tasks] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      select: { title: true, isActive: true },
    }),
    prisma.practicalTask.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
      select: { title: true },
    }),
  ]);

  if (!mod?.isActive || tasks.length === 0) {
    return buildPracticePageMetadataFromInput({ moduleActive: false });
  }

  const practiceTitle = resolvePracticeMetaTitle(tasks);

  if (!practiceTitle) {
    return buildPracticePageMetadataFromInput({ moduleActive: false });
  }

  return buildPracticePageMetadataFromInput({
    moduleActive: true,
    canExposePracticeDetails: true,
    practiceTitle,
    moduleTitle: mod.title,
  });
}
