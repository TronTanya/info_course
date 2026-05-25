import type { Metadata } from "next";
import { extractLessonGoal } from "@/lib/lesson-page-ui";

/** Кабинет и учебные экраны — только для авторизованных, без индексации. */
export const DASHBOARD_LESSON_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

const DEFAULT_LESSON_TITLE = "Лекция — CyberEdu";

const DEFAULT_LESSON_DESCRIPTION =
  "Учебная лекция на платформе CyberEdu. Материал доступен после входа в личный кабинет.";

const META_DESCRIPTION_MAX = 160;

/** Убираем разметку контента и лишние пробелы — в meta только краткий публичный сниппет. */
export function sanitizeLessonMetaDescription(raw: string): string {
  const cleaned = raw
    .replace(/:::[\w-]+/g, " ")
    .replace(/[#*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return DEFAULT_LESSON_DESCRIPTION;
  if (cleaned.length <= META_DESCRIPTION_MAX) return cleaned;
  const slice = cleaned.slice(0, META_DESCRIPTION_MAX - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > 48 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed}…`;
}

/**
 * Краткое описание из вводного блока (intro / why / первый абзац), без тела урока и ответов.
 */
export function buildLessonMetaDescription(content: string | null | undefined): string {
  if (!content?.trim()) return DEFAULT_LESSON_DESCRIPTION;
  const goal = extractLessonGoal(content);
  if (!goal?.trim()) return DEFAULT_LESSON_DESCRIPTION;
  return sanitizeLessonMetaDescription(goal);
}

export type BuildLessonPageMetadataInput = {
  /** Активен ли модуль в каталоге */
  moduleActive: boolean;
  /**
   * Разрешено ли показывать название и краткое описание урока в meta.
   * false для гостей, locked-модулей и неактивных модулей — без утечек в SEO.
   */
  canExposeLessonDetails?: boolean;
  lessonTitle?: string | null;
  lessonContent?: string | null;
};

function privateLessonMetadata(): Metadata {
  return {
    title: { absolute: DEFAULT_LESSON_TITLE },
    description: DEFAULT_LESSON_DESCRIPTION,
    robots: DASHBOARD_LESSON_ROBOTS,
  };
}

export function buildLessonPageMetadata(input: BuildLessonPageMetadataInput): Metadata {
  const canExpose =
    input.moduleActive &&
    input.canExposeLessonDetails === true &&
    Boolean(input.lessonTitle?.trim());

  if (!canExpose) {
    return privateLessonMetadata();
  }

  const title = `${input.lessonTitle!.trim()} — CyberEdu`;

  return {
    title: { absolute: title },
    description: buildLessonMetaDescription(input.lessonContent),
    robots: DASHBOARD_LESSON_ROBOTS,
  };
}
