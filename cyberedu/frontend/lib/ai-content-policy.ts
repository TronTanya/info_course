import { moderateUserPrompt } from "@/lib/security/ai-moderation";

/** @deprecated Используйте moderateUserPrompt из `@/lib/security/ai-moderation` */
export function assertSafeTutorUserMessage(message: string): { ok: true } | { ok: false; reason: string } {
  const r = moderateUserPrompt(message);
  if (!r.ok) return r;
  return { ok: true };
}
