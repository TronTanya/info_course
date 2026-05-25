/**
 * Правила повторной попытки теста (клиент + сервер).
 * Лимит задаётся через props страницы или TEST_MAX_ATTEMPTS_PER_TEST на сервере.
 */

export const TEST_ATTEMPTS_EXHAUSTED_MESSAGE =
  "Попытки закончились. Обратитесь к преподавателю.";

export function isTestAttemptLimitConfigured(maxAttempts: number | null | undefined): boolean {
  return maxAttempts != null && maxAttempts > 0;
}

/** Уже использовано attemptsUsed попыток при лимите maxAttempts. */
export function isTestAttemptsExhausted(
  attemptsUsed: number,
  maxAttempts: number | null | undefined,
): boolean {
  return isTestAttemptLimitConfigured(maxAttempts) && attemptsUsed >= maxAttempts!;
}

/** Можно начать новую попытку / нажать «Повторить тест». */
export function resolveTestCanRetry(args: {
  attemptsUsed: number;
  maxAttempts?: number | null;
  locked?: boolean;
}): boolean {
  if (args.locked) return false;
  if (!isTestAttemptLimitConfigured(args.maxAttempts)) return true;
  return !isTestAttemptsExhausted(args.attemptsUsed, args.maxAttempts);
}

/** Лимит из окружения (сервер); null — без лимита. */
export function getTestAttemptLimitFromEnv(): number | null {
  const raw = process.env.TEST_MAX_ATTEMPTS_PER_TEST?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function resolveTestAttemptLimit(
  explicitMax?: number | null,
): number | null {
  if (isTestAttemptLimitConfigured(explicitMax)) return explicitMax!;
  return getTestAttemptLimitFromEnv();
}

export type TestAttemptGuardResult = { ok: true } | { ok: false; error: string };

/** Проверка перед созданием новой попытки (Server Action). */
export function assertTestAttemptAllowed(
  existingAttemptCount: number,
  maxAttempts?: number | null,
): TestAttemptGuardResult {
  const limit = resolveTestAttemptLimit(maxAttempts);
  if (!isTestAttemptLimitConfigured(limit)) return { ok: true };
  if (isTestAttemptsExhausted(existingAttemptCount, limit)) {
    return { ok: false, error: TEST_ATTEMPTS_EXHAUSTED_MESSAGE };
  }
  return { ok: true };
}

export function testLessonHref(moduleId: string): string {
  return `/dashboard/course/${moduleId}/lesson`;
}

export function testPracticeHref(moduleId: string): string {
  return `/dashboard/course/${moduleId}/practice`;
}
