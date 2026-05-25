import { isAiConfigured } from "@/lib/ai-config";
import type { ReadinessChecks } from "@/lib/health/readiness";
import { getStorageDriver, type StorageDriver } from "@/lib/storage";

export type SystemStatusHealth = "ok" | "degraded" | "unknown";
export type SystemStatusAi = "ok" | "disabled" | "degraded" | "unknown";

/** Безопасные поля для админ-панели статуса (без URL, env и деталей ошибок). */
export type SystemStatusPanelData = {
  database: SystemStatusHealth;
  /** Не задано, если Redis в этой среде не используется. */
  redis?: SystemStatusHealth;
  ai: SystemStatusAi;
  storage: SystemStatusHealth;
  lastBackupAt?: string;
  lastSmokeTestAt?: string;
};

/** @deprecated Используйте `SystemStatusPanelData`. */
export type AdminSystemStatusPanel = SystemStatusPanelData;

type OpsTimestampKey = "ADMIN_LAST_BACKUP_AT" | "ADMIN_LAST_SMOKE_TEST_AT";

function mapDatabaseStatus(check: ReadinessChecks["database"]): SystemStatusHealth {
  if (check === "ok") return "ok";
  if (check === "error") return "degraded";
  return "unknown";
}

function mapRedisStatus(check: ReadinessChecks["redis"]): SystemStatusHealth | undefined {
  if (check === "skipped") return undefined;
  if (check === "ok") return "ok";
  if (check === "error") return "degraded";
  return "unknown";
}

function mapAiStatus(): SystemStatusAi {
  return isAiConfigured() ? "ok" : "disabled";
}

function mapStorageStatus(driver: StorageDriver): SystemStatusHealth {
  if (driver === "local") return "ok";
  return "degraded";
}

/** Отсекает connection strings, hostnames и прочие ops-значения, небезопасные для UI. */
export function isUnsafeOpsTimestampValue(raw: string): boolean {
  if (raw.length > 64) return true;
  const lower = raw.toLowerCase();
  if (/:\/\//.test(raw) || /@/.test(raw) || /\\/.test(raw) || /=/.test(raw)) return true;
  if (/^[A-Z][A-Z0-9_]*=/i.test(raw)) return true;
  if (/postgres|redis|mysql|mongodb|amqp/i.test(lower)) return true;
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.local\b|\.internal\b|\.corp\b/i.test(lower)) return true;
  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(:\d+)?$/i.test(raw.trim())) return true;
  return false;
}

/** Только ISO-дата из ops env; без путей, URL, hostnames и имён переменных в UI. */
function readSafeOpsTimestamp(key: OpsTimestampKey): string | undefined {
  const raw = process.env[key]?.trim();
  if (!raw || isUnsafeOpsTimestampValue(raw)) return undefined;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return undefined;
  return new Date(ms).toISOString();
}

/** Собирает безопасный снимок инфраструктуры для админки. */
export function buildSystemStatusPanelData(checks: ReadinessChecks): SystemStatusPanelData {
  const data: SystemStatusPanelData = {
    database: mapDatabaseStatus(checks.database),
    ai: mapAiStatus(),
    storage: mapStorageStatus(getStorageDriver()),
  };

  const redis = mapRedisStatus(checks.redis);
  if (redis !== undefined) data.redis = redis;

  const lastBackupAt = readSafeOpsTimestamp("ADMIN_LAST_BACKUP_AT");
  const lastSmokeTestAt = readSafeOpsTimestamp("ADMIN_LAST_SMOKE_TEST_AT");
  if (lastBackupAt) data.lastBackupAt = lastBackupAt;
  if (lastSmokeTestAt) data.lastSmokeTestAt = lastSmokeTestAt;

  return data;
}
