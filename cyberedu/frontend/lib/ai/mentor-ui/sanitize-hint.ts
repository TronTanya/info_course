import { sanitizeLessonContentForPrompt } from "@/lib/ai/tutor/moderation/lesson-content";

const MAX_MENTOR_CLIENT_HINT = 2_000;

/** Краткий контекст с клиента (итог теста, темы для повторения) — без HTML и инъекций. */
export function sanitizeMentorClientHint(raw: string | null | undefined, maxLen = MAX_MENTOR_CLIENT_HINT): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  return sanitizeLessonContentForPrompt(t, maxLen);
}
