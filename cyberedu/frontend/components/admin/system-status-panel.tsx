import { Activity } from "lucide-react";
import type { SystemStatusPanelData, SystemStatusAi, SystemStatusHealth } from "@/lib/admin-system-status-panel";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

/** Подписи строк — без технических имён сервисов и hostnames. */
const ROW_LABELS = {
  database: "Database",
  redis: "Redis",
  ai: "AI",
  storage: "Storage",
  lastBackup: "Last backup",
  lastSmokeTest: "Last smoke test",
} as const;

function statusBadgeVariant(
  status: SystemStatusHealth | SystemStatusAi,
): "success" | "warning" | "secondary" | "danger" {
  if (status === "ok") return "success";
  if (status === "disabled" || status === "unknown") return "secondary";
  if (status === "degraded") return "warning";
  return "danger";
}

function formatOpsAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: SystemStatusHealth | SystemStatusAi;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/50 px-3 py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <Badge variant={statusBadgeVariant(status)} className="font-mono text-[11px] uppercase tracking-wide">
        {status}
      </Badge>
    </div>
  );
}

function OpsTimestampRow({ label, iso }: { label: string; iso: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/50 px-3 py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <time className="text-xs tabular-nums text-muted-foreground" dateTime={iso}>
        {formatOpsAt(iso)}
      </time>
    </div>
  );
}

/**
 * Статус инфраструктуры для админки (только ADMIN).
 * Принимает уже санитизированные данные — не connection strings, env и hostnames.
 */
export function SystemStatusPanel({
  data,
  className,
}: {
  data: SystemStatusPanelData;
  className?: string;
}) {
  return (
    <SectionCard
      variant="default"
      flushTitle
      className={cn("p-4 sm:p-6", className)}
      id="system-status"
    >
      <div className="flex items-center gap-2">
        <Activity className="size-5 text-muted-foreground" aria-hidden />
        <h2 className="font-display text-base font-semibold text-foreground">Статус системы</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Обобщённые статусы сервисов: ok, degraded, unknown, disabled — без секретов и деталей ошибок.
      </p>
      <div className="mt-4 space-y-2" role="list" aria-label="Статус инфраструктуры">
        <div role="listitem">
          <StatusRow label={ROW_LABELS.database} status={data.database} />
        </div>
        {data.redis !== undefined ? (
          <div role="listitem">
            <StatusRow label={ROW_LABELS.redis} status={data.redis} />
          </div>
        ) : null}
        <div role="listitem">
          <StatusRow label={ROW_LABELS.ai} status={data.ai} />
        </div>
        <div role="listitem">
          <StatusRow label={ROW_LABELS.storage} status={data.storage} />
        </div>
        {data.lastBackupAt ? (
          <div role="listitem">
            <OpsTimestampRow label={ROW_LABELS.lastBackup} iso={data.lastBackupAt} />
          </div>
        ) : null}
        {data.lastSmokeTestAt ? (
          <div role="listitem">
            <OpsTimestampRow label={ROW_LABELS.lastSmokeTest} iso={data.lastSmokeTestAt} />
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
