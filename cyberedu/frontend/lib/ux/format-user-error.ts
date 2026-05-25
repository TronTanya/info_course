/**
 * Преобразует технические/серверные сообщения в понятный текст для UI.
 * Не логирует и не показывает секреты.
 */
export function formatUserFacingError(message: string): string {
  const raw = message.trim();
  if (!raw) return "Не удалось выполнить действие. Попробуйте ещё раз.";

  const m = raw.toLowerCase();

  if (
    m.includes("слишком много") ||
    m.includes("rate limit") ||
    m.includes("429") ||
    m.includes("too many")
  ) {
    return "Слишком много попыток за короткий срок. Подождите несколько минут и повторите — это защита платформы от злоупотреблений.";
  }

  if (m.includes("redis") && (m.includes("unavailable") || m.includes("недоступ"))) {
    return "Сервис временно перегружен. Попробуйте позже или обратитесь к администратору курса.";
  }

  if (m.includes("csrf") || m.includes("запрос отклонён")) {
    return "Сессия устарела. Обновите страницу и повторите действие.";
  }

  if (m.includes("unauthorized") || m.includes("не авторизован")) {
    return "Войдите в аккаунт, чтобы продолжить.";
  }

  return raw;
}

/** Ошибки отправки теста (Server Action, сеть, rate limit). */
export function formatTestSubmitError(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message.trim().toLowerCase();
    if (
      m.includes("failed to fetch") ||
      m.includes("networkerror") ||
      m.includes("network request failed") ||
      m.includes("load failed") ||
      m.includes("fetch failed")
    ) {
      return "Нет связи с сервером. Проверьте интернет и нажмите «Отправить» снова — ответы сохранены в черновике.";
    }
    if (err.name === "TypeError" && (m.includes("fetch") || m.includes("network"))) {
      return "Нет связи с сервером. Проверьте интернет и повторите отправку.";
    }
    return formatUserFacingError(err.message);
  }
  return formatUserFacingError("");
}
