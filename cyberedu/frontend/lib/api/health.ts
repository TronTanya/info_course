import { apiGet } from "@/lib/api/http";

export type BackendHealth = { status: string; service: string };

/** Проверка доступности Python API (для отладки / будущего статуса в UI). */
export function fetchBackendHealth(): Promise<BackendHealth> {
  return apiGet<BackendHealth>("/api/v1/health");
}
