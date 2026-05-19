import { moduleDifficultyByOrder } from "@/lib/course-path-ui";
import { parseLessonStructure } from "@/components/lesson/lesson-structured-text";

export function extractLessonGoal(source: string): string | null {
  const segments = parseLessonStructure(source);
  const intro = segments.find((s) => s.type === "intro");
  if (intro?.body?.trim()) return intro.body.trim();
  const why = segments.find((s) => s.type === "why");
  if (why?.body?.trim()) return why.body.trim();
  const firstP = segments.find((s) => s.type === "p");
  if (firstP && firstP.type === "p") {
    const t = firstP.text.trim();
    return t.length > 280 ? `${t.slice(0, 277)}…` : t;
  }
  return null;
}

export function extractPracticeBlock(source: string): { title: string; body: string } | null {
  const segments = parseLessonStructure(source);
  const mini = segments.find((s) => s.type === "mini_case");
  if (mini && mini.type === "mini_case") {
    return { title: mini.title, body: mini.body };
  }
  const how = segments.find((s) => s.type === "how");
  if (how && how.type === "how") {
    return { title: how.title, body: how.body };
  }
  return null;
}

export function getLessonDifficultyLabel(moduleOrderNumber: number): string {
  return moduleDifficultyByOrder(moduleOrderNumber);
}
