/**
 * Интересы профиля: версионированный JSON в поле Profile.interests
 * для удобной передачи в AI (теги + свой текст).
 *
 * Формат v1: { "version": 1, "tags": string[], "custom": string }
 */

export const INTEREST_TAG_OPTIONS = [
  "игры",
  "программирование",
  "спорт",
  "музыка",
  "дизайн",
  "кино",
  "киберспорт",
  "техника",
  "автомобили",
  "аниме",
  "путешествия",
  "бизнес",
] as const;

export type InterestTag = (typeof INTEREST_TAG_OPTIONS)[number];

export type ProfileInterestsV1 = {
  version: 1;
  tags: string[];
  /** Свободный текст (доп. интересы, уточнения) */
  custom: string;
};

const V1 = 1 as const;

const KNOWN_TAG_SET = new Set<string>(INTEREST_TAG_OPTIONS);

export function isInterestTag(value: string): value is InterestTag {
  return (INTEREST_TAG_OPTIONS as readonly string[]).includes(value);
}

function mergeUnknownTagsIntoCustom(tags: string[], custom: string): { tags: InterestTag[]; custom: string } {
  const known: InterestTag[] = [];
  const unknown: string[] = [];
  for (const t of tags) {
    const s = typeof t === "string" ? t.trim() : "";
    if (!s) continue;
    if (KNOWN_TAG_SET.has(s)) {
      known.push(s as InterestTag);
    } else {
      unknown.push(s);
    }
  }
  const mergedCustom = [custom.trim(), ...unknown].filter(Boolean).join(", ").trim();
  return { tags: [...new Set(known)], custom: mergedCustom };
}

/** Разбор из БД: JSON v1 или устаревшая строка (через запятую). Неизвестные теги попадают в custom. */
export function parseProfileInterests(raw: string | null | undefined): ProfileInterestsV1 {
  if (!raw || !raw.trim()) {
    return { version: V1, tags: [], custom: "" };
  }
  try {
    const data = JSON.parse(raw) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "version" in data &&
      (data as { version: unknown }).version === 1 &&
      "tags" in data &&
      Array.isArray((data as { tags: unknown }).tags)
    ) {
      const tags = (data as { tags: unknown[] }).tags.filter((t): t is string => typeof t === "string");
      const custom =
        "custom" in data && typeof (data as { custom: unknown }).custom === "string"
          ? (data as { custom: string }).custom
          : "";
      const merged = mergeUnknownTagsIntoCustom(tags, custom);
      return { version: V1, tags: merged.tags, custom: merged.custom };
    }
  } catch {
    /* legacy */
  }
  const parts = raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const merged = mergeUnknownTagsIntoCustom(parts, "");
  return { version: V1, tags: merged.tags, custom: merged.custom };
}

export function serializeProfileInterests(data: ProfileInterestsV1): string {
  return JSON.stringify({
    version: 1,
    tags: [...new Set(data.tags)],
    custom: data.custom.trim(),
  });
}

/** Компактная строка для системного промпта AI. */
export function interestsForAiPrompt(data: ProfileInterestsV1): string {
  const tags = data.tags.length ? data.tags.join(", ") : "нет выбранных тегов";
  const custom = data.custom.trim();
  const lines = [
    "Интересы пользователя (структурировано):",
    `- Теги: ${tags}`,
    custom ? `- Дополнительно: ${custom}` : "- Дополнительно: не указано",
  ];
  return lines.join("\n");
}

/** Для отображения на странице профиля (человекочитаемо). */
export function formatInterestsDisplay(data: ProfileInterestsV1): string {
  const parts = [...data.tags];
  if (data.custom.trim()) parts.push(data.custom.trim());
  return parts.length ? parts.join(" · ") : "—";
}

/** Готовый фрагмент для подстановки в system/user prompt при AI-адаптации лекций. */
export function profileInterestsPromptBlockFromDb(raw: string | null | undefined): string {
  return interestsForAiPrompt(parseProfileInterests(raw));
}
