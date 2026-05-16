/** Дата из поля `type="date"` (YYYY-MM-DD) в UTC-полдень для `@db.Date`. */
export function dateFromYmd(ymd: string): Date {
  const [y, m, day] = ymd.split("-").map(Number);
  if (!y || !m || !day || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(day)) {
    return new Date(ymd);
  }
  return new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
}

/** Значение для `<input type="date" />` из `Date` из БД. */
export function toDateInputValue(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Отображение даты рождения на странице профиля. */
export function formatBirthDateRu(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m, day)));
}
