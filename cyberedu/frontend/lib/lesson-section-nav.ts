import {
  parseLessonStructure,
  type LessonSegment,
} from "@/components/lesson/lesson-structured-text";

export type LessonSectionKind =
  | "heading"
  | "theory"
  | "example"
  | "warning"
  | "intro"
  | "why"
  | "how"
  | "practice"
  | "remember"
  | "term"
  | "other";

export type LessonSectionNavItem = {
  id: string;
  label: string;
  kind: LessonSectionKind;
};

export const LESSON_SECTION_KIND_LABELS: Record<LessonSectionKind, string> = {
  heading: "Раздел",
  theory: "Теория",
  example: "Пример",
  warning: "Предупреждение",
  intro: "Вступление",
  why: "Зачем",
  how: "Как применить",
  practice: "Кейс",
  remember: "Запомнить",
  term: "Термин",
  other: "Материал",
};

type SegmentType = LessonSegment["type"];

const NAV_TYPES = new Set<SegmentType>([
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

function segmentKind(type: SegmentType): LessonSectionKind {
  switch (type) {
    case "h2":
    case "h3":
      return "heading";
    case "theory":
      return "theory";
    case "ex":
      return "example";
    case "warning":
    case "danger":
      return "warning";
    case "intro":
      return "intro";
    case "why":
      return "why";
    case "how":
      return "how";
    case "mini_case":
      return "practice";
    case "remember":
      return "remember";
    case "def":
      return "term";
    default:
      return "other";
  }
}

export function getSegmentNavLabel(seg: LessonSegment): string {
  switch (seg.type) {
    case "h2":
    case "h3":
      return seg.text.trim() || "Раздел";
    case "p":
      return seg.text.trim().slice(0, 48) || "Абзац";
    default:
      if ("title" in seg && seg.title.trim()) return seg.title.trim();
      return LESSON_SECTION_KIND_LABELS[segmentKind(seg.type)];
  }
}

/** Стабильный id секции — совпадает с id в LessonStructuredText при том же индексе. */
export function lessonSectionId(navIndex: number, label: string): string {
  const slug = label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `ls-${navIndex}-${slug || "block"}`;
}

export function buildLessonSectionNav(
  source: string,
  skipTypes: SegmentType[] = [],
): LessonSectionNavItem[] {
  const segments = parseLessonStructure(source);
  const skip = new Set(skipTypes);
  const items: LessonSectionNavItem[] = [];
  let navIndex = 0;

  for (const seg of segments) {
    if (skip.has(seg.type) || !NAV_TYPES.has(seg.type)) continue;
    const label = getSegmentNavLabel(seg);
    const kind = segmentKind(seg.type);
    items.push({
      id: lessonSectionId(navIndex, label),
      label: label.length > 56 ? `${label.slice(0, 53)}…` : label,
      kind,
    });
    navIndex += 1;
  }

  return items;
}

export type LessonBlockTypeCounts = Partial<Record<LessonSectionKind, number>>;

export function countLessonBlockTypes(source: string): LessonBlockTypeCounts {
  const segments = parseLessonStructure(source);
  const counts: LessonBlockTypeCounts = {};

  for (const seg of segments) {
    const kind = segmentKind(seg.type);
    if (kind === "other" && seg.type !== "warning" && seg.type !== "danger") continue;
    counts[kind] = (counts[kind] ?? 0) + 1;
  }

  return counts;
}
