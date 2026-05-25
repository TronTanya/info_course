import { getSystemStatusPanelData } from "@/lib/admin-system-status-panel-loader";
import { SystemStatusPanel } from "@/components/admin/system-status-panel";

/**
 * Server-only обёртка: данные грузятся только после `assertAdminDataAccess`.
 * Используйте на страницах `/admin/*` вместо прямого импорта readiness в UI.
 */
export async function SystemStatusPanelSection({ className }: { className?: string }) {
  const data = await getSystemStatusPanelData();
  return <SystemStatusPanel data={data} className={className} />;
}
