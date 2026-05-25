import Link from "next/link";
import { Shield } from "lucide-react";
import { AdminAuditSeverityBadge } from "@/components/admin/admin-audit-severity-badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import type { AdminAuditEvent } from "@/lib/admin-lms-dashboard";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminSuspiciousEventsPanel({
  events,
  auditLogAvailable,
  id = "security-watch",
  maxItems = 8,
}: {
  events: AdminAuditEvent[];
  auditLogAvailable: boolean;
  id?: string;
  maxItems?: number;
}) {
  const visible = events.slice(0, maxItems);

  return (
    <SectionCard variant="lab" flushTitle className="min-w-0 p-4 sm:p-6" id={id}>
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-cyan" aria-hidden />
        <h2 className="font-display text-base font-semibold text-foreground">Подозрительные действия</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Неудачные входы, смена ролей, guardrail AI и rate limit — без секретов и meta.
      </p>
      {!auditLogAvailable ? (
        <EmptyState
          className="mt-4 py-6"
          title="Журнал отключён"
          description="Включите SECURITY_AUDIT_DB, чтобы видеть события безопасности."
        />
      ) : visible.length === 0 ? (
        <AdminEmptyState
          kind="no_audit"
          className="mt-4"
          description="Подозрительных записей за последнее время нет."
        />
      ) : (
        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {visible.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{e.actionLabel}</span>
                <AdminAuditSeverityBadge severity={e.severity} />
              </div>
              <p className="mt-1 text-muted-foreground">
                {formatAt(e.at)} · {e.actorLabel}
                {e.path ? ` · ${e.path}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
      <Button asChild variant="ghost" size="sm" className="mt-4 min-h-11 w-full">
        <Link href="/admin/profile">Security dashboard</Link>
      </Button>
    </SectionCard>
  );
}
