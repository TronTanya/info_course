import { moduleDifficultyByOrder } from "@/lib/course-path-ui";
import { parseLessonStructure } from "@/components/lesson/lesson-structured-text";

export type LessonSelfCheckItem = {
  question: string;
  hint?: string;
};

function bulletLines(body: string): string[] {
  return body
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s+/, "").trim())
    .filter(Boolean);
}

/** Ключевые идеи из структуры урока (remember, outro, чеклист) — без изменения исходного контента. */
export function extractKeyIdeas(source: string, max = 6): string[] {
  const segments = parseLessonStructure(source);
  const ideas: string[] = [];

  for (const seg of segments) {
    if (seg.type === "remember" || seg.type === "outro") {
      if (seg.title && !["Запомни", "Итог", "Вступление"].includes(seg.title)) {
        ideas.push(seg.title);
      }
      ideas.push(...bulletLines(seg.body));
    }
    if (seg.type === "checklist") {
      for (const item of seg.items) {
        if (item.text.trim()) ideas.push(item.text.trim());
      }
    }
    if (seg.type === "def" && seg.title.trim()) {
      const short = seg.body.trim();
      ideas.push(short.length <= 120 ? `${seg.title}: ${short}` : seg.title);
    }
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const line of ideas) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(line);
    if (unique.length >= max) break;
  }
  return unique;
}

/** Вопросы для блока «Проверь себя» из чеклиста и предупреждений в материале. */
export function extractSelfCheckItems(source: string, max = 5): LessonSelfCheckItem[] {
  const segments = parseLessonStructure(source);
  const items: LessonSelfCheckItem[] = [];

  for (const seg of segments) {
    if (seg.type === "checklist") {
      for (const item of seg.items) {
        items.push({ question: item.text.trim(), hint: "Отметьте, если можете объяснить своими словами." });
      }
    }
    if (seg.type === "warning") {
      items.push({
        question: seg.title || "Что может пойти не так?",
        hint: seg.body.trim() || undefined,
      });
    }
    if (seg.type === "how") {
      items.push({
        question: `Как применить: ${seg.title}`,
        hint: seg.body.trim() || undefined,
      });
    }
  }

  return items.slice(0, max);
}

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
