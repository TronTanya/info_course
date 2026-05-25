/**
 * AI Safety Policy — CyberEdu наставник (ЭТАП 4).
 * Единые правила, детекция запросов на списывание и безопасные отказы с альтернативой.
 */

import {
  buildMentorRefusalStructured,
  formatMentorRefusalMessage,
  type MentorRefusalStructured,
} from "@/lib/ai/safety/mentor-refusal-copy";
import { buildTutorSystemPrompt, type BuildSystemPromptParams } from "@/lib/ai/tutor/prompts/system";
import type { TutorPageContext, TutorRefusalCode } from "@/lib/ai/tutor/types";
import {
  sanitizeAIMentorContextInput,
  type SanitizeAIMentorContextResult,
} from "@/lib/ai/mentor-ui/safe-context-mapper";
import type { AIMentorContextInput, AIMentorSourceType } from "@/types/ai-mentor";

/** Разрешённые виды помощи (для документации и тестов). */
export const AI_MENTOR_ALLOWED_BEHAVIORS = [
  "explain_theory",
  "safe_examples",
  "self_check_questions",
  "summarize_lesson",
  "analysis_direction",
  "conceptual_error_explanation",
  "structure_student_answer",
] as const;

/** Запрещённые виды помощи. */
export const AI_MENTOR_FORBIDDEN_BEHAVIORS = [
  "ready_test_answers",
  "choose_answer_option",
  "full_practice_solution",
  "hidden_rubric",
  "solution_disclosure",
  "answer_key",
  "grading_bypass",
  "course_rules_violation",
  "real_harmful_actions",
] as const;

export const AI_MENTOR_SAFETY_POLICY_TEXT = [
  "# Политика AI-наставника CyberEdu",
  "",
  "## Разрешено",
  "- Объяснять теорию и термины в учебном контексте.",
  "- Приводить безопасные примеры (без атакующих пошаговых инструкций).",
  "- Задавать 2–3 вопроса для самопроверки понимания.",
  "- Делать краткий конспект материала (без спойлеров проверок).",
  "- Давать направление анализа и первый шаг рассуждения.",
  "- Объяснять ошибки концептуально после теста (без правильных вариантов).",
  "- Помогать структурировать ответ студента (без готового текста решения).",
  "",
  "## Запрещено",
  "- Выдавать готовые ответы на тесты или выбирать вариант за студента.",
  "- Полностью решать практическую лабораторию за студента.",
  "- Раскрывать hidden rubric, solution, answer key, exact auto-check rules.",
  "- Подсказывать обход системы проверки или нарушение правил курса.",
  "- Помогать с реальными вредоносными действиями (взлом, эксплойты, malware).",
  "",
  "## При отказе",
  "- Не ограничиваться словом «нельзя» — предложить безопасную альтернативу обучения.",
].join("\n");

export type AssessmentAnswerRequestKind =
  | "test_answer"
  | "choose_option"
  | "full_practice_solution"
  | "rubric_disclosure"
  | "solution_disclosure"
  | "answer_key"
  | "grading_bypass"
  | "course_cheating"
  | "harmful_action";

type DetectionRule = {
  kind: AssessmentAnswerRequestKind;
  patterns: RegExp[];
};

const ASSESSMENT_DETECTION_RULES: DetectionRule[] = [
  {
    kind: "harmful_action",
    patterns: [
      /как\s+взломать/i,
      /how\s+to\s+hack/i,
      /(напиши|сгенерируй|дай)\s+.*(exploit|эксплойт|payload|вирус|малвар)/i,
      /(reverse\s*shell|bind\s*shell)/i,
      /обойти\s+(защиту|антивирус|2fa|фаервол|проверк)/i,
      /(ddos|ддос)\s*(атак|скрипт)/i,
    ],
  },
  {
    kind: "answer_key",
    patterns: [
      /\banswer\s*key\b/i,
      /ключ\s+(ответ|проверк|задан)/i,
      /правильн(ые|ый)\s+(флаг|id|ключ)/i,
      /correctflagids/i,
    ],
  },
  {
    kind: "solution_disclosure",
    patterns: [
      /\bsolution\b/i,
      /эталонн(ый|ое)\s+решение/i,
      /готовое\s+решение/i,
      /дай\s+готовое\s+решение/i,
      /готовое\s+решение\s+целиком/i,
      /полный\s+ответ/i,
      /напиши\s+ответ\s+за/i,
    ],
  },
  {
    kind: "rubric_disclosure",
    patterns: [
      /hidden\s*rubric/i,
      /скрыт(ая|ый)\s+rubric/i,
      /критерии\s+автопроверк/i,
      /auto\s*keywords/i,
      /правила\s+оценивания\s+скрипт/i,
    ],
  },
  {
    kind: "grading_bypass",
    patterns: [
      /обойти\s+(проверк|систем|модерац|автопроверк)/i,
      /как\s+сдать\s+без/i,
      /обмануть\s+(систем|проверк|тест)/i,
      /списать\s+на/i,
    ],
  },
  {
    kind: "course_cheating",
    patterns: [
      /наруш(ить|ение)\s+правил/i,
      /обман(ить)?\s+преподав/i,
      /списать\s+(у|на)/i,
      /cheat\s+on/i,
    ],
  },
  {
    kind: "choose_option",
    patterns: [
      /какой\s+вариант\s+(правильн|верн|выбрать)/i,
      /какой\s+вариант\s+выбрать/i,
      /выбери\s+(вариант|ответ)/i,
      /(a|b|c|d)\s+или\s+(a|b|c|d)/i,
      /правильный\s+вариант/i,
      /что\s+выбрать\s+в\s+тесте/i,
      /дай\s+правильн(ый|ый)?\s+ответ/i,
    ],
  },
  {
    kind: "test_answer",
    patterns: [
      /ответ\s+на\s+тест/i,
      /готовый\s+ответ/i,
      /реши\s+тест/i,
      /сдай\s+тест/i,
      /баллы?\s+на\s+тест/i,
      /(вариант|номер)\s+ответа\s+в\s+тесте/i,
    ],
  },
  {
    kind: "full_practice_solution",
    patterns: [
      /реши\s+(за\s+меня|лаборатор|практик)/i,
      /сделай\s+за\s+меня\s+.*(практик|лаб)/i,
      /полностью\s+реш/i,
      /готовый\s+текст\s+для\s+сдачи/i,
      /напиши\s+работу\s+за/i,
      /напиши\s+практик/i,
      /напиши\s+практику\s+за/i,
    ],
  },
];

export type DetectAssessmentAnswerRequestOptions = {
  pageContext?: TutorPageContext;
  sourceType?: AIMentorSourceType;
};

/**
 * Эвристика: запрос на готовый ответ / списывание / вредоносное действие.
 * Детерминированно, без LLM.
 */
export function detectAssessmentAnswerRequest(
  message: string,
  opts?: DetectAssessmentAnswerRequestOptions,
): AssessmentAnswerRequestKind | null {
  const text = message.trim();
  if (!text) return null;

  for (const rule of ASSESSMENT_DETECTION_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return rule.kind;
    }
  }

  if (opts?.pageContext?.practicalTask || opts?.sourceType === "practice") {
    if (/реши\s+за\s+меня/i.test(text) || /сделай\s+за\s+меня/i.test(text)) {
      return "full_practice_solution";
    }
  }

  return null;
}

export type CreateAIMentorRefusalOptions = {
  /** Тема для подстановки в альтернативу (фишинг, пароли, …). */
  topicLabel?: string;
};

export type AIMentorRefusal = {
  refused: true;
  kind: AssessmentAnswerRequestKind | "policy_blocked" | "prompt_injection" | "generic";
  code: TutorRefusalCode;
  message: string;
  safetyReason: string;
  alternativeHint: string;
  structured: MentorRefusalStructured;
};

export type { MentorRefusalStructured } from "@/lib/ai/safety/mentor-refusal-copy";

const REFUSAL_COPY: Record<
  AssessmentAnswerRequestKind | "policy_blocked" | "prompt_injection" | "generic",
  { code: TutorRefusalCode; safetyReason: string; alternative: (topic: string) => string }
> = {
  test_answer: {
    code: "exam_spoiler",
    safetyReason: "Запрос на готовый ответ к тесту.",
    alternative: (topic) =>
      `Я не могу выдать готовый ответ на тест, но могу объяснить, как разобраться с темой «${topic}»: на что смотреть в формулировке и какие признаки проверить самостоятельно.`,
  },
  choose_option: {
    code: "exam_spoiler",
    safetyReason: "Запрос выбрать вариант ответа за студента.",
    alternative: (topic) =>
      `Я не могу выбрать ответ за вас, но могу объяснить, как определить признаки по теме «${topic}» и отсеять явно неверные варианты своим рассуждением.`,
  },
  full_practice_solution: {
    code: "exam_spoiler",
    safetyReason: "Запрос полностью решить практическую лабораторию.",
    alternative: () =>
      "Я не решу лабораторию полностью, но помогу составить план анализа: с чего начать, что зафиксировать и как оформить вывод без готового эталона.",
  },
  rubric_disclosure: {
    code: "exam_spoiler",
    safetyReason: "Запрос раскрыть скрытые критерии проверки.",
    alternative: () =>
      "Я не раскрываю скрытые критерии и rubric автопроверки. Могу подсказать, какие **публичные** требования к формату ответа обычно важны и как проверить работу самому.",
  },
  solution_disclosure: {
    code: "exam_spoiler",
    safetyReason: "Запрос эталонного решения.",
    alternative: () =>
      "Я не выдаю готовое solution. Давайте разберём ваш ход мысли: что уже сделано, где затык, и какой следующий учебный шаг на 5–10 минут.",
  },
  answer_key: {
    code: "exam_spoiler",
    safetyReason: "Запрос ключа ответов.",
    alternative: () =>
      "Я не раскрываю answer key. Могу помочь понять **логику** задания и типичные ошибки, чтобы вы сами пришли к обоснованному выводу.",
  },
  grading_bypass: {
    code: "policy_blocked",
    safetyReason: "Запрос обойти систему проверки.",
    alternative: () =>
      "Я не помогаю обходить проверку. Если что-то не засчитывается — разберём критерии сдачи и как улучшить ответ в рамках правил курса.",
  },
  course_cheating: {
    code: "policy_blocked",
    safetyReason: "Запрос нарушить правила курса.",
    alternative: () =>
      "Я не помогаю нарушать правила курса. Могу подсказать, как готовиться честно: конспект → самопроверка → практика.",
  },
  harmful_action: {
    code: "offensive_attack",
    safetyReason: "Запрос вредоносных или атакующих действий.",
    alternative: (topic) =>
      `Я не даю инструкций для атак. Могу объяснить, как **распознать** угрозу по теме «${topic}» и какие меры **защиты** применяют.`,
  },
  policy_blocked: {
    code: "policy_blocked",
    safetyReason: "Запрос вне учебной политики.",
    alternative: () =>
      "Переформулируйте вопрос по материалам модуля, лекции или защите в легальном учебном контексте.",
  },
  prompt_injection: {
    code: "prompt_injection",
    safetyReason: "Попытка изменить правила наставника.",
    alternative: () =>
      "Задайте обычный учебный вопрос по текущему уроку или практике — без инструкций для системы.",
  },
  generic: {
    code: "exam_spoiler",
    safetyReason: "Запрос не соответствует учебной политике наставника.",
    alternative: () =>
      "Вместо готового решения давайте разберём идею задания и первый шаг, который вы можете сделать сами.",
  },
};

function defaultTopicLabel(opts?: CreateAIMentorRefusalOptions): string {
  return opts?.topicLabel?.trim() || "кибербезопасность";
}

/**
 * Безопасный отказ с альтернативой (не только «нельзя»).
 */
export function createAIMentorRefusal(
  kind: AssessmentAnswerRequestKind | "policy_blocked" | "prompt_injection" | "generic",
  opts?: CreateAIMentorRefusalOptions,
): AIMentorRefusal {
  const copy = REFUSAL_COPY[kind];
  const structured = buildMentorRefusalStructured(kind, { topicLabel: defaultTopicLabel(opts) });

  return {
    refused: true,
    kind,
    code: copy.code,
    message: formatMentorRefusalMessage(structured),
    safetyReason: copy.safetyReason,
    alternativeHint: structured.alternative,
    structured,
  };
}

export type BuildSafeMentorPromptParams = BuildSystemPromptParams & {
  modePolicyBlock?: string;
};

/**
 * System prompt = базовая политика наставника + канон AI Safety Policy + режим/контекст.
 */
export function buildSafeMentorPrompt(params: BuildSafeMentorPromptParams): string {
  const extra = [
    AI_MENTOR_SAFETY_POLICY_TEXT,
    params.modePolicyBlock,
    ...(params.extraBlocks ?? []),
  ].filter(Boolean) as string[];

  return buildTutorSystemPrompt({
    difficulty: params.difficulty,
    topic: params.topic,
    practiceSocraticHints: params.practiceSocraticHints,
    extraBlocks: extra,
  });
}

export type SanitizeAIContextOptions = {
  allowUserDraft?: boolean;
  defaultSourceType?: AIMentorSourceType;
};

/**
 * Единая точка очистки AI context (UI и API).
 * Удаляет запрещённые ключи даже если клиент передал лишнее.
 */
export function sanitizeAIContext(
  input: AIMentorContextInput | Record<string, unknown> | null | undefined,
  opts?: SanitizeAIContextOptions,
): SanitizeAIMentorContextResult {
  return sanitizeAIMentorContextInput(input, opts);
}
