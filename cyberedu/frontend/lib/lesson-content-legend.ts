import { parseLessonStructure } from "@/components/lesson/lesson-structured-text";
import { LESSON_CALLOUT_HEADINGS } from "@/lib/lesson-callout-types";
import { LESSON_SECTION_KIND_LABELS } from "@/lib/lesson-section-nav";

export type LessonContentLegendKey =
  | "theory"
  | "example"
  | "warning"
  | "checklist"
  | "remember"
  | "term"
  | "intro";

export type LessonContentLegendItem = {
  key: LessonContentLegendKey;
  label: string;
  count: number;
};

const LEGEND_ORDER: LessonContentLegendKey[] = [
  "intro",
  "theory",
  "example",
  "warning",
  "checklist",
  "remember",
  "term",
];

const KEY_LABELS: Record<LessonContentLegendKey, string> = {
  intro: LESSON_SECTION_KIND_LABELS.intro,
  theory: LESSON_SECTION_KIND_LABELS.theory,
  example: LESSON_SECTION_KIND_LABELS.example,
  warning: LESSON_SECTION_KIND_LABELS.warning,
  checklist: LESSON_CALLOUT_HEADINGS.checklist,
  remember: LESSON_SECTION_KIND_LABELS.remember,
  term: LESSON_SECTION_KIND_LABELS.term,
};

function segmentToLegendKey(type: string): LessonContentLegendKey | null {
  switch (type) {
    case "intro":
    case "why":
      return "intro";
    case "theory":
      return "theory";
    case "ex":
    case "mini_case":
    case "how":
      return "example";
    case "warning":
    case "danger":
      return "warning";
    case "checklist":
      return "checklist";
    case "remember":
    case "outro":
      return "remember";
    case "def":
    case "terms":
      return "term";
    default:
      return null;
  }
}

/** Считает типы блоков в исходном markdown урока для легенды материала. */
export function buildLessonContentLegendItems(content: string): LessonContentLegendItem[] {
  const segments = parseLessonStructure(content);
  const counts = new Map<LessonContentLegendKey, number>();

  for (const seg of segments) {
    const key = segmentToLegendKey(seg.type);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return LEGEND_ORDER.filter((key) => (counts.get(key) ?? 0) > 0).map((key) => ({
    key,
    label: KEY_LABELS[key],
    count: counts.get(key) ?? 0,
  }));
}

/** Для обратной совместимости с LessonIntroPanel. */
export function countLessonContentLegend(content: string): Partial<Record<LessonContentLegendKey, number>> {
  const items = buildLessonContentLegendItems(content);
  const out: Partial<Record<LessonContentLegendKey, number>> = {};
  for (const item of items) out[item.key] = item.count;
  return out;
}
