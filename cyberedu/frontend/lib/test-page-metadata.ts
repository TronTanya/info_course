import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { checkModuleAccessForApi } from "@/lib/course-progress-guards";
import { DASHBOARD_LESSON_ROBOTS } from "@/lib/lesson-page-metadata";

const DEFAULT_TEST_TITLE = "Тест модуля — CyberEdu";

const DEFAULT_TEST_DESCRIPTION =
  "Контрольный тест на платформе CyberEdu. Доступен после входа в личный кабинет.";

const META_TITLE_MAX = 80;
const META_MODULE_MAX = 72;

/** Публичный сниппет без текста вопросов и разметки. */
export function sanitizeTestMetaLabel(raw: string, maxLen: number): string {
  const cleaned = raw.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxLen) return cleaned;
  const slice = cleaned.slice(0, maxLen - 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 16 ? slice.slice(0, lastSpace) : slice;
  return `${base}…`;
}

export function buildTestMetaDescription(moduleTitle: string): string {
  const moduleLabel = sanitizeTestMetaLabel(moduleTitle, META_MODULE_MAX);
  if (!moduleLabel) return DEFAULT_TEST_DESCRIPTION;
  return `Проверка знаний по модулю ${moduleLabel}.`;
}

export type BuildTestPageMetadataInput = {
  moduleActive: boolean;
  /**
   * Разрешено ли показывать название теста и модуля в meta.
   * false для гостей и закрытых модулей — без утечек в SEO.
   */
  canExposeTestDetails?: boolean;
  testTitle?: string | null;
  moduleTitle?: string | null;
};

function privateTestMetadata(): Metadata {
  return {
    title: { absolute: DEFAULT_TEST_TITLE },
    description: DEFAULT_TEST_DESCRIPTION,
    robots: DASHBOARD_LESSON_ROBOTS,
  };
}

/** Синхронная сборка metadata (без вопросов и ответов). */
export function buildTestPageMetadataFromInput(input: BuildTestPageMetadataInput): Metadata {
  const canExpose =
    input.moduleActive &&
    input.canExposeTestDetails === true &&
    Boolean(input.testTitle?.trim()) &&
    Boolean(input.moduleTitle?.trim());

  if (!canExpose) {
    return privateTestMetadata();
  }

  const testTitle = sanitizeTestMetaLabel(input.testTitle!.trim(), META_TITLE_MAX);
  const moduleTitle = sanitizeTestMetaLabel(input.moduleTitle!.trim(), META_MODULE_MAX);

  if (!testTitle || !moduleTitle) {
    return privateTestMetadata();
  }

  return {
    title: { absolute: `${testTitle} — CyberEdu` },
    description: buildTestMetaDescription(moduleTitle),
    robots: DASHBOARD_LESSON_ROBOTS,
  };
}

/**
 * Metadata страницы теста: только название теста и модуля при доступе студента.
 * Тексты вопросов, варианты и персональные данные не загружаются.
 */
export async function buildTestPageMetadata(
  moduleId: string,
  userId: string | undefined,
): Promise<Metadata> {
  if (!userId) {
    return buildTestPageMetadataFromInput({ moduleActive: false });
  }

  const access = await checkModuleAccessForApi(userId, moduleId);
  if (!access.ok) {
    return buildTestPageMetadataFromInput({ moduleActive: false });
  }

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true, isActive: true },
  });

  if (!mod?.isActive) {
    return buildTestPageMetadataFromInput({ moduleActive: false });
  }

  const test = await prisma.test.findFirst({
    where: { moduleId },
    orderBy: { createdAt: "asc" },
    select: { title: true },
  });

  if (!test?.title?.trim()) {
    return buildTestPageMetadataFromInput({ moduleActive: false });
  }

  return buildTestPageMetadataFromInput({
    moduleActive: true,
    canExposeTestDetails: true,
    testTitle: test.title,
    moduleTitle: mod.title,
  });
}
