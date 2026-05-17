import type { MentorContextKind } from "@/lib/ai/mentor-ui/types";

export type SuggestedPrompt = { id: string; label: string; text: string };

const LESSON: SuggestedPrompt[] = [
  {
    id: "l1",
    label: "Суть лекции",
    text: "Объясни главную идею этой лекции простыми словами и задай мне один проверочный вопрос.",
  },
  {
    id: "l2",
    label: "Пример из жизни",
    text: "Приведи безопасный пример из повседневной жизни, связанный с темой лекции.",
  },
  {
    id: "l3",
    label: "Термины",
    text: "Разбери 2–3 ключевых термина из лекции и как их применяет защитник.",
  },
];

const PRACTICE: SuggestedPrompt[] = [
  {
    id: "p1",
    label: "С чего начать",
    text: "Как безопасно подойти к этому практическому заданию, не раскрывая готовое решение?",
  },
  {
    id: "p2",
    label: "Критерии",
    text: "На какие признаки и критерии мне стоит обратить внимание при выполнении задания?",
  },
  {
    id: "p3",
    label: "Ошибки",
    text: "Какие типичные ошибки студентов допускают в таких заданиях и как их избежать?",
  },
];

const MODULE: SuggestedPrompt[] = [
  {
    id: "m1",
    label: "План модуля",
    text: "Как лучше выстроить изучение этого модуля: лекция, тест, практика?",
  },
  {
    id: "m2",
    label: "CIA",
    text: "Кратко объясни триаду CIA и приведи пример для темы модуля.",
  },
];

const GENERAL: SuggestedPrompt[] = [
  {
    id: "g1",
    label: "Фишинг",
    text: "Как распознать фишинговое письмо и что делать, если я на него кликнул?",
  },
  {
    id: "g2",
    label: "Пароли",
    text: "Какие правила создания и хранения паролей рекомендует современная практика?",
  },
  {
    id: "g3",
    label: "Инцидент",
    text: "Какие первые шаги должен сделать пользователь при подозрении на компрометацию?",
  },
];

export function getSuggestedPrompts(kind: MentorContextKind): SuggestedPrompt[] {
  switch (kind) {
    case "lesson":
      return LESSON;
    case "practice":
      return PRACTICE;
    case "module":
      return MODULE;
    default:
      return GENERAL;
  }
}
