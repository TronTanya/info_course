import type { ApiGuardOptions } from "@/lib/security/api-guard";

/** Стандартная защита POST /api/practice/* */
export const PRACTICE_API_GUARD: Pick<ApiGuardOptions, "requireAuth" | "rateLimit"> = {
  requireAuth: true,
  rateLimit: "practiceCheck",
};

/** Загрузки файлов (multipart). */
export const UPLOAD_API_GUARD: Pick<ApiGuardOptions, "requireAuth" | "rateLimit" | "skipBodyParse"> = {
  requireAuth: true,
  rateLimit: "upload",
  skipBodyParse: true,
};
