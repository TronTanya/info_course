import {
  buildMentorRefusalStructured,
  type MentorRefusalKind,
  type MentorRefusalStructured,
} from "@/lib/ai/safety/mentor-refusal-copy";
import type { TutorRefusalCode } from "@/lib/ai/tutor/types";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";

export type MentorRefusalUi = {
  title: string;
  description: string;
  actionHint: string;
};

export type MentorRefusalStructuredUi = MentorRefusalStructured & {
  title: string;
};

export type MentorRefusalSuggestedAction = {
  id: "explain" | "hint" | "check" | "plan";
  label: string;
  prompt: string;
};

const CODE_TITLES: Record<TutorRefusalCode, string> = {
  exam_spoiler: "Без готовых ответов",
  offensive_attack: "Только защита",
  policy_blocked: "Вне учебной политики",
  prompt_injection: "Роль наставника фиксирована",
  output_blocked: "Ответ не прошёл проверку",
  provider_error: "Сервис недоступен",
};

const COPY: Record<TutorRefusalCode, MentorRefusalUi> = {
  exam_spoiler: {
    title: CODE_TITLES.exam_spoiler,
    description:
      "Наставник не выдаёт ключи к тестам и практическим заданиям — это защищает честность обучения и ценность сертификата.",
    actionHint: "Выберите действие ниже или опишите, на каком шаге вы застряли.",
  },
  offensive_attack: {
    title: CODE_TITLES.offensive_attack,
    description: "Пошаговые инструкции для атак и обхода защит в чате не раскрываются.",
    actionHint: "Спросите, как распознать угрозу или какие меры защиты применяют.",
  },
  policy_blocked: {
    title: CODE_TITLES.policy_blocked,
    description: "Запрос не подходит для учебного чата курса по информационной безопасности.",
    actionHint: "Переформулируйте по материалам модуля, лекции или легальной защите.",
  },
  prompt_injection: {
    title: CODE_TITLES.prompt_injection,
    description: "Нельзя переопределить правила наставника через сообщения в чате.",
    actionHint: "Задайте обычный учебный вопрос по текущему материалу.",
  },
  output_blocked: {
    title: CODE_TITLES.output_blocked,
    description: "Текст отфильтрован модерацией вывода — попробуйте короче и по теме урока.",
    actionHint: "Сократите вопрос и уберите просьбы о готовых решениях.",
  },
  provider_error: {
    title: CODE_TITLES.provider_error,
    description: "Наставник временно не отвечает — это не отказ по политике обучения.",
    actionHint: "Повторите запрос через несколько минут.",
  },
};

const DEFAULT_REFUSAL: MentorRefusalUi = {
  title: "Учебный формат",
  description: "Ответ сформирован с ограничениями: без готовых решений и без атакующих инструкций.",
  actionHint: "Используйте режимы сверху или переформулируйте вопрос.",
};

/** Кнопки безопасной альтернативы после отказа (ЭТАП 14). */
export const MENTOR_REFUSAL_SUGGESTED_ACTIONS: readonly MentorRefusalSuggestedAction[] = [
  {
    id: "explain",
    label: "Объясни тему",
    prompt:
      "Объясни тему текущего урока простыми словами: ключевые идеи, типичные ошибки и один проверочный вопрос без готового ответа.",
  },
  {
    id: "hint",
    label: "Дай подсказку",
    prompt:
      "Дай подсказку без готового ответа: только направление, на что обратить внимание и первый шаг анализа.",
  },
  {
    id: "check",
    label: "Проверь моё понимание",
    prompt:
      "Задай 2–3 вопроса, чтобы я проверил понимание темы. Не называй правильные варианты и готовые решения.",
  },
  {
    id: "plan",
    label: "Составь план анализа",
    prompt:
      "Помоги составить план анализа задания: этапы, на что смотреть, чего избегать. Без готового решения и без ключей ответов.",
  },
] as const;

export function getMentorRefusalUi(code?: TutorRefusalCode): MentorRefusalUi {
  if (!code) return DEFAULT_REFUSAL;
  return COPY[code] ?? DEFAULT_REFUSAL;
}

export function getMentorRefusalStructuredUi(opts: {
  refusalCode?: TutorRefusalCode;
  refusalKind?: MentorRefusalKind;
  topicLabel?: string;
}): MentorRefusalStructuredUi {
  const kind = resolveRefusalKind(opts);
  const structured = buildMentorRefusalStructured(kind, { topicLabel: opts.topicLabel });
  const title = opts.refusalCode ? (CODE_TITLES[opts.refusalCode] ?? DEFAULT_REFUSAL.title) : structured.denial;

  return { ...structured, title };
}

function resolveRefusalKind(opts: {
  refusalCode?: TutorRefusalCode;
  refusalKind?: MentorRefusalKind;
}): MentorRefusalKind {
  if (opts.refusalKind) return opts.refusalKind;
  if (opts.refusalCode === "prompt_injection") return "prompt_injection";
  if (opts.refusalCode === "policy_blocked") return "policy_blocked";
  if (opts.refusalCode === "offensive_attack") return "harmful_action";
  return "generic";
}

export function isMentorRefusalMessage(meta?: TutorPipelineMeta): boolean {
  if (!meta) return false;
  return Boolean(meta.refused || meta.refusalCode);
}

/** Показывать структурированный отказ с кнопками (не дублировать длинный markdown). */
export function shouldShowStructuredRefusal(meta?: TutorPipelineMeta): boolean {
  if (!isMentorRefusalMessage(meta)) return false;
  if (meta?.refusalCode === "provider_error" || meta?.refusalCode === "output_blocked") {
    return false;
  }
  return true;
}
