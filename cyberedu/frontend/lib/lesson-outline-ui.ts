import {
  parseLessonStructure,
  type LessonSegment,
} from "@/components/lesson/lesson-structured-text";
import { getSegmentNavLabel, lessonSectionId } from "@/lib/lesson-section-nav";

/** Якоря статических разделов страницы урока (совпадают с id в разметке). */
export const LESSON_OUTLINE_ANCHORS = {
  goals: "lesson-objectives-heading",
  terms: "lesson-key-terms-heading",
  material: "lesson-main-heading",
  checkpoint: "lesson-checkpoint-heading",
  checkpointEmpty: "lesson-checkpoint-empty-heading",
  completion: "lesson-completion-card-heading",
} as const;

export type LessonOutlineItemKind = "static" | "content";

export type LessonOutlineItem = {
  id: string;
  label: string;
  /** 0 — раздел страницы; 1 — h2; 2 — h3 */
  depth: 0 | 1 | 2;
  kind: LessonOutlineItemKind;
};

export const LESSON_OUTLINE_STATIC_LABELS = {
  goals: "Цели",
  terms: "Термины",
  material: "Материал",
  checkpoint: "Самопроверка",
  completion: "Завершение",
} as const;

const NAV_TYPES = new Set<LessonSegment["type"]>([
  "h2",
  "h3",
  "theory",
  "ex",
  "warning",
  "intro",
  "why",
  "how",
  "mini_case",
  "remember",
  "def",
  "outro",
]);

function truncateLabel(label: string, max = 52): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

/** Заголовки h2/h3 с теми же id, что в LessonStructuredText. */
export function buildLessonContentHeadings(
  source: string,
  skipTypes: LessonSegment["type"][] = [],
): LessonOutlineItem[] {
  const segments = parseLessonStructure(source);
  const skip = new Set(skipTypes);
  let navIndex = 0;
  const items: LessonOutlineItem[] = [];

  for (const seg of segments) {
    if (skip.has(seg.type) || !NAV_TYPES.has(seg.type)) continue;
    const label = getSegmentNavLabel(seg);
    if (seg.type === "h2" || seg.type === "h3") {
      items.push({
        id: lessonSectionId(navIndex, label),
        label: truncateLabel(label),
        depth: seg.type === "h3" ? 2 : 1,
        kind: "content",
      });
    }
    navIndex += 1;
  }

  return items;
}

function staticOutlineItem(
  id: string,
  label: string,
): LessonOutlineItem {
  return { id, label, depth: 0, kind: "static" };
}

export function buildLessonStaticOutline(hasCheckpointQuestions: boolean): LessonOutlineItem[] {
  return [
    staticOutlineItem(LESSON_OUTLINE_ANCHORS.goals, LESSON_OUTLINE_STATIC_LABELS.goals),
    staticOutlineItem(LESSON_OUTLINE_ANCHORS.terms, LESSON_OUTLINE_STATIC_LABELS.terms),
    staticOutlineItem(LESSON_OUTLINE_ANCHORS.material, LESSON_OUTLINE_STATIC_LABELS.material),
    staticOutlineItem(
      hasCheckpointQuestions
        ? LESSON_OUTLINE_ANCHORS.checkpoint
        : LESSON_OUTLINE_ANCHORS.checkpointEmpty,
      LESSON_OUTLINE_STATIC_LABELS.checkpoint,
    ),
    staticOutlineItem(LESSON_OUTLINE_ANCHORS.completion, LESSON_OUTLINE_STATIC_LABELS.completion),
  ];
}

export type BuildLessonOutlineInput = {
  content: string;
  bodySkipTypes: LessonSegment["type"][];
  /** Есть вопросы мини-проверки (иначе якорь empty-state) */
  hasCheckpointQuestions: boolean;
  /** Минимум заголовков в теле, чтобы встроить оглавление по h2/h3 */
  minContentHeadings?: number;
};

/**
 * Оглавление: при ≥2 заголовках h2/h3 в материале — статические блоки страницы + заголовки;
 * иначе только статические разделы.
 */
export function buildLessonOutline(input: BuildLessonOutlineInput): LessonOutlineItem[] {
  const minHeadings = input.minContentHeadings ?? 2;
  const contentHeadings = buildLessonContentHeadings(input.content, input.bodySkipTypes);
  const staticShell = buildLessonStaticOutline(input.hasCheckpointQuestions);

  if (contentHeadings.length >= minHeadings) {
    const [goals, terms, material, checkpoint, completion] = staticShell;
    return [goals!, terms!, material!, ...contentHeadings, checkpoint!, completion!];
  }

  return staticShell;
}
