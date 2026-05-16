/**
 * Форматирование дат для Client Components при SSR: без явного timeZone Node и браузер
 * могут выдать разный текст → React #418 (hydration mismatch).
 * Для меток «когда создано» используем UTC — одинаково на сервере и клиенте.
 */

export function formatRuDateLongUtc(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("ru-RU", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRuDateTimeShortUtc(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("ru-RU", {
    timeZone: "UTC",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatRuDateTimeFullUtc(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("ru-RU", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
