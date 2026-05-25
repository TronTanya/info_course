import type { AdminExportType } from "@/lib/admin-export-types";

export type AdminExportPhase = "idle" | "loading" | "error" | "success";

export function parseAdminExportError(status: number, body: string): string {
  if (status === 401) return "Требуется вход под администратором.";
  if (status === 403) return "Недостаточно прав для экспорта.";
  if (status === 429) return "Превышен лимит экспорта (10 в час). Повторите позже.";
  try {
    const json = JSON.parse(body) as { error?: string };
    if (json.error) return json.error;
  } catch {
    /* ignore */
  }
  if (status >= 500) return "Сервер временно недоступен. Попробуйте позже.";
  return "Не удалось сформировать файл. Повторите попытку.";
}

export function filenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? fallback;
}

export function parseExportRowCount(header: string | null): number | null {
  if (!header) return null;
  const n = Number.parseInt(header, 10);
  return Number.isFinite(n) ? n : null;
}

export function adminExportFallbackFilename(type: AdminExportType): string {
  const day = new Date().toISOString().slice(0, 10);
  return `cyberedu-${type}-${day}.csv`;
}

export function formatAdminExportAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Сброс UI при смене типа отчёта. */
export function adminExportTypeChangeReset(): {
  phase: AdminExportPhase;
  errorMessage: null;
} {
  return { phase: "idle", errorMessage: null };
}
