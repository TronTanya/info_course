import type { TutorPageContext, TutorTopic } from "@/lib/ai/tutor/types";

type Rule = { topic: TutorTopic; patterns: RegExp[] };

const RULES: Rule[] = [
  {
    topic: "prompt_injection",
    patterns: [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
      /(jailbreak|dan\s+mode|developer\s+mode)/i,
      /ты\s+теперь\s+/i,
      /system\s*:\s*/i,
      /раскрой\s+(системный|скрытый)\s+промпт/i,
    ],
  },
  {
    topic: "offensive_request",
    patterns: [
      /как\s+взломать/i,
      /how\s+to\s+hack/i,
      /(write|напиши)\s+.*(exploit|эксплойт|payload)/i,
      /(reverse\s*shell|bind\s*shell)/i,
      /обойти\s+(защиту|антивирус|2fa|фаервол)/i,
      /(ddos|ддос)\s*(атак|скрипт)/i,
      /(sql\s*инъекци|union\s+select|drop\s+table).*(сделай|напиши|покажи)/i,
    ],
  },
  {
    topic: "academic_integrity",
    patterns: [
      /(готовый|правильный)\s+ответ/i,
      /реши\s+за\s+меня/i,
      /сдай\s+задание/i,
      /ответ\s+на\s+тест/i,
      /правильный\s+вариант/i,
    ],
  },
  {
    topic: "phishing_social",
    patterns: [/фишинг/i, /phishing/i, /социальн/i, /подозрительн.*письм/i],
  },
  {
    topic: "passwords_auth",
    patterns: [/парол/i, /password/i, /\b2fa\b/i, /многофактор/i, /\bmfa\b/i],
  },
  {
    topic: "malware_awareness",
    patterns: [/\bвирус/i, /\bвредонос/i, /\bmalware/i, /\bтроян/i, /\bransomware/i],
  },
  {
    topic: "crypto_basics",
    patterns: [/\bшифр/i, /\bcrypto/i, /\bbase64/i, /\bхеш/i, /\bhash\b/i, /\bцезар/i],
  },
  {
    topic: "logging_soc",
    patterns: [/\bжурнал/i, /\blog\b/i, /\bsiem/i, /\bрасследован/i, /\bинцидент/i],
  },
  {
    topic: "network_web",
    patterns: [/\bhttps/i, /\burl\b/i, /\bсеть/i, /\bdns\b/i, /\bпорт\b/i],
  },
  {
    topic: "practice_help",
    patterns: [/\bпрактик/i, /\bзадани/i, /\bлаборатор/i, /\bсдать\s+работу/i],
  },
];

/**
 * Классификация темы запроса (эвристика, детерминированно, без LLM).
 */
export function classifyTutorTopic(message: string, pageContext: TutorPageContext): TutorTopic {
  const text = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.topic;
  }
  if (pageContext.practicalTask) return "practice_help";
  if (pageContext.lessonExcerpt) return "general";
  return "general";
}

export function topicLabelRu(topic: TutorTopic): string {
  const map: Record<TutorTopic, string> = {
    general: "общая кибербезопасность",
    phishing_social: "фишинг и социальная инженерия",
    passwords_auth: "пароли и аутентификация",
    malware_awareness: "вредоносное ПО",
    network_web: "сеть и веб-безопасность",
    crypto_basics: "криптография (учебно)",
    logging_soc: "журналы и расследование",
    practice_help: "практическое задание",
    academic_integrity: "учебная честность",
    offensive_request: "атакующие техники (отказ)",
    prompt_injection: "манипуляция промптом",
  };
  return map[topic] ?? topic;
}
