import type { PracticeInstruction, SafeRubricItem } from "@/types/practice-view-model";

export const TASK_INSTRUCTIONS_EMPTY_MESSAGE = "Инструкции к заданию будут добавлены позже.";

export const TASK_INSTRUCTIONS_SECTION_LABELS = {
  whatToDo: "Что нужно сделать",
  answerFormat: "Формат ответа",
  minimumRequirements: "Минимальные требования",
  constraints: "Ограничения",
} as const;

export type TaskInstructionsSections = {
  whatToDo: string[];
  answerFormat: string[];
  minimumRequirements: string[];
  constraints: string[];
};

/** Разбивает текст инструкции на пункты (абзацы или предложения). */
export function splitPracticeInstructionText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const byNewline = trimmed
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byNewline.length > 1) return dedupeLines(byNewline);

  const single = byNewline[0] ?? trimmed;
  const sentences = single
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);
  if (sentences.length > 1) return dedupeLines(sentences);

  return [single];
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

type RubricBucket = keyof Pick<TaskInstructionsSections, "answerFormat" | "minimumRequirements" | "constraints">;

/** Классификация публичных пунктов рубрики (без regex и эталонов). */
function classifySafeRubricLine(title: string): RubricBucket | null {
  const t = title.trim();
  const lower = t.toLowerCase();
  if (!t) return null;
  if (lower.startsWith("формат:")) return "answerFormat";
  if (
    lower.includes("не короче") ||
    lower.includes("текст отчёта") ||
    lower.includes("нужно выполнить") ||
    lower.includes("требуется краткое") ||
    lower.includes("проверяется вручную по вашему описанию")
  ) {
    return "minimumRequirements";
  }
  if (
    lower.startsWith("проверка:") ||
    lower.includes("файл:") ||
    lower.includes("демо-данные") ||
    lower.includes("проверяются на сервере") ||
    lower.includes("не отображаются") ||
    lower.includes("проверяется автоматически")
  ) {
    return "constraints";
  }
  return "constraints";
}

export function buildTaskInstructionsSections(
  instructions: PracticeInstruction[],
  safeRubric: SafeRubricItem[],
): TaskInstructionsSections {
  const whatToDo: string[] = [];
  for (const item of instructions) {
    for (const line of splitPracticeInstructionText(item.text)) {
      whatToDo.push(line);
    }
  }

  const sections: TaskInstructionsSections = {
    whatToDo: dedupeLines(whatToDo),
    answerFormat: [],
    minimumRequirements: [],
    constraints: [],
  };

  for (const item of safeRubric) {
    const bucket = classifySafeRubricLine(item.title);
    if (!bucket) continue;
    sections[bucket].push(item.title.trim());
  }

  sections.answerFormat = dedupeLines(sections.answerFormat);
  sections.minimumRequirements = dedupeLines(sections.minimumRequirements);
  sections.constraints = dedupeLines(sections.constraints);

  return sections;
}

export function isTaskInstructionsReady(sections: TaskInstructionsSections): boolean {
  return (
    sections.whatToDo.length > 0 ||
    sections.answerFormat.length > 0 ||
    sections.minimumRequirements.length > 0 ||
    sections.constraints.length > 0
  );
}
