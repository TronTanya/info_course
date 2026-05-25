import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BookMarked,
  Compass,
  FileText,
  HelpCircle,
  ListTree,
  Sparkles,
} from "lucide-react";
import type { MentorContextKind } from "@/lib/ai/mentor-ui/types";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import type { AIMentorMode } from "@/types/ai-mentor";
import { AI_MENTOR_MODES } from "@/types/ai-mentor";

export type { AIMentorMode };
export type MentorModeId = AIMentorMode;

export type MentorMode = {
  id: AIMentorMode;
  label: string;
  description: string;
  icon: LucideIcon;
  surfaces: MentorSurface[];
};

/** Режимы учебной панели AI-наставника. */
export const MENTOR_MODES: MentorMode[] = [
  {
    id: "explain_simple",
    label: "Объясни проще",
    description: "Тема простыми словами",
    icon: Sparkles,
    surfaces: ["lesson", "practice", "test_result", "dashboard", "standalone"],
  },
  {
    id: "give_example",
    label: "Приведи пример",
    description: "Безопасный учебный кейс",
    icon: BookMarked,
    surfaces: ["lesson", "practice", "test_result", "dashboard", "standalone"],
  },
  {
    id: "check_understanding",
    label: "Проверь понимание",
    description: "2–3 вопроса для самопроверки",
    icon: HelpCircle,
    surfaces: ["lesson", "practice", "test_result", "dashboard", "standalone"],
  },
  {
    id: "summarize",
    label: "Сделай конспект",
    description: "Краткое резюме урока",
    icon: FileText,
    surfaces: ["lesson", "test_result", "dashboard", "standalone"],
  },
  {
    id: "hint_only",
    label: "Дай подсказку",
    description: "Направление без готового ответа",
    icon: Compass,
    surfaces: ["lesson", "practice", "dashboard", "standalone"],
  },
  {
    id: "review_mistake",
    label: "Разбор ошибки",
    description: "После теста, без правильных ответов",
    icon: AlertCircle,
    surfaces: ["test_result", "dashboard", "standalone"],
  },
  {
    id: "improve_reasoning",
    label: "Улучшить аргументацию",
    description: "Структура и логика без готового ответа",
    icon: ListTree,
    surfaces: ["practice"],
  },
];

/** Порядок режимов в AIModeSelector (все 7). */
export const AI_MODE_SELECTOR_ORDER: AIMentorMode[] = [
  "explain_simple",
  "give_example",
  "check_understanding",
  "summarize",
  "hint_only",
  "review_mistake",
  "improve_reasoning",
];

export function getMentorModesForSurface(surface: MentorSurface): MentorMode[] {
  return MENTOR_MODES.filter((m) => m.surfaces.includes(surface));
}

function contextHint(kind: MentorContextKind): string {
  switch (kind) {
    case "lesson":
      return "по текущей лекции";
    case "practice":
      return "по текущей практике (без готового решения задания)";
    case "test":
      return "по результату теста (без правильных ответов на вопросы)";
    case "module":
      return "по текущему модулю курса";
    default:
      return "по кибербезопасности в учебном формате";
  }
}

export function buildMentorModePrompt(modeId: AIMentorMode, kind: MentorContextKind): string {
  const ctx = contextHint(kind);
  switch (modeId) {
    case "explain_simple":
      return `Объясни проще ${ctx}: главную идею, 3–5 коротких тезисов и один проверочный вопрос мне. Без готовых ответов на тест или практику.`;
    case "give_example":
      return `Приведи безопасный учебный пример ${ctx}. Без атакующих шагов и без готовых ответов на проверку.`;
    case "check_understanding":
      return `Проверь моё понимание ${ctx}: задай 2–3 вопроса для самопроверки и кратко скажи, на что обратить внимание. Не давай ответы на тест или практику.`;
    case "hint_only":
      return `Дай подсказку ${ctx}, но не готовый ответ: только направление мысли и первый шаг, без полного решения.`;
    case "summarize":
      return `Сделай конспект ${ctx}: заголовки, 5–8 пунктов, термины и «что запомнить». Без спойлеров теста и без решения практики.`;
    case "review_mistake":
      return `Помоги разобрать ошибки ${ctx}: почему могли возникнуть пробелы и как готовиться дальше. Не называй правильные варианты ответов.`;
    case "improve_reasoning":
      return `Помоги улучшить аргументацию ${ctx}: предложи структуру ответа (тезис, аргументы, вывод), но не пиши готовый текст решения за меня.`;
  }
}

export { AI_MENTOR_MODES };
