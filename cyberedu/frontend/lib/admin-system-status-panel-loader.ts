import { assertAdminDataAccess } from "@/lib/admin-access";
import { runReadinessChecks } from "@/lib/health/readiness";
import {
  buildSystemStatusPanelData,
  type SystemStatusPanelData,
} from "@/lib/admin-system-status-panel";

/**
 * Безопасный снимок статуса для админки. Только ADMIN (`assertAdminDataAccess`).
 * Не возвращает connection strings, env values и детали ошибок инфраструктуры.
 */
export async function getSystemStatusPanelData(): Promise<SystemStatusPanelData> {
  await assertAdminDataAccess();
  const checks = await runReadinessChecks();
  return buildSystemStatusPanelData(checks);
}
