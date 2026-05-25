import Link from "next/link";
import { AlertTriangle, Shield } from "lucide-react";
import { CertificatesAdminPanel } from "@/components/admin/certificates-admin-panel";
import { AdminImportantEventsPanel } from "@/components/admin/admin-important-events-panel";
import { AdminOverviewMetricsStrip } from "@/components/admin/admin-overview-metrics-strip";
import { AdminSuspiciousEventsPanel } from "@/components/admin/admin-suspicious-events-panel";
import { StudentsOverview } from "@/components/admin/students-overview";
import type { AdminControlCenterData } from "@/lib/admin-control-center";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminKpiCards } from "@/components/admin/admin-kpi-cards";
import { ContentManagementPreview } from "@/components/admin/content-management-preview";
import { CourseHealthPanel } from "@/components/admin/course-health-panel";
import { PracticeReviewQueue } from "@/components/admin/practice-review-queue";
import { AdminExportPanel } from "@/components/admin/admin-export-panel";
import { SystemStatusPanel } from "@/components/admin/system-status-panel";
import { Button } from "@/components/ui/button";
import { AdminAuditSeverityBadge } from "@/components/admin/admin-audit-severity-badge";
import { AdminEmptyState, AdminReviewQueueLoadError } from "@/components/admin/admin-states";
import { SectionCard } from "@/components/ui/section-card";
import type { CertificatesAdminPanelData } from "@/lib/certificates-admin-panel-logic";
import { cn } from "@/lib/utils";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminControlCenter({
  data,
  users,
  certificatesPanel,
}: {
  data: AdminControlCenterData;
  users: AdminUserListRow[];
  certificatesPanel: CertificatesAdminPanelData;
}) {
  const {
    kpis,
    system,
    practiceReviewQueue,
    certificates,
    courseHealth,
    contentManagement,
    auditEvents,
    overview,
    importantEvents,
    suspiciousEvents,
    stats,
    reviewQueueLoadError,
  } = data;

  const auditFeed = auditEvents.slice(0, 14);
  const showAlerts =
    overview.pendingSubmissions > 0 ||
    suspiciousEvents.length > 0 ||
    certificates.eligibleWithoutCert > 0;

  return (
    <div className="ce-admin-control-center min-w-0 max-w-full space-y-6 overflow-x-clip sm:space-y-8">
      <AdminHeader pendingSubmissions={overview.pendingSubmissions} />

      {showAlerts ? (
        <section
          aria-label="Требует внимания"
          className="rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 sm:px-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
            <p className="text-sm font-medium text-foreground">Требует внимания</p>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {overview.pendingSubmissions > 0 ? (
              <li>
                <Link href="/admin/submissions?filter=pending" className="text-primary hover:underline">
                  {overview.pendingSubmissions} работ на проверке
                </Link>
              </li>
            ) : null}
            {certificates.eligibleWithoutCert > 0 ? (
              <li>
                <Link href="/admin/certificates" className="text-primary hover:underline">
                  {certificates.eligibleWithoutCert} готовы к выдаче сертификата
                </Link>
              </li>
            ) : null}
            {suspiciousEvents.length > 0 ? (
              <li>
                <a href="#admin-suspicious-watch" className="text-primary hover:underline">
                  {suspiciousEvents.length} подозрительных событий
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <AdminKpiCards data={kpis} />

      <AdminOverviewMetricsStrip
        overview={overview}
        publishedReviewsCount={stats.publishedReviewsCount}
      />

      <div className="ce-admin-control-center__grid grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:items-start">
        <div className="ce-admin-control-center__main flex min-w-0 flex-col gap-6">
          <AdminImportantEventsPanel events={importantEvents} />
          <SectionCard
            variant="lab"
            flushTitle
            className="ce-admin-control-center__queue min-w-0 p-4 sm:p-6 xl:min-h-[18rem]"
            id="practice-review-queue"
          >
            {reviewQueueLoadError ? (
              <AdminReviewQueueLoadError className="mt-4" />
            ) : (
              <PracticeReviewQueue
                items={practiceReviewQueue}
                pendingCount={overview.pendingSubmissions}
                pageSize={8}
              />
            )}
          </SectionCard>

          <div className="ce-admin-control-center__health">
            <CourseHealthPanel data={courseHealth} />
          </div>

          <SectionCard variant="lab" flushTitle className="min-w-0 overflow-hidden" id="students-overview">
            <StudentsOverview rows={users} embedded pageSize={8} />
          </SectionCard>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <ContentManagementPreview data={contentManagement} />

            <CertificatesAdminPanel data={certificatesPanel} />
          </div>
        </div>

        <aside className="ce-admin-control-center__sidebar flex min-w-0 flex-col gap-6 xl:sticky xl:top-4 xl:self-start">
          <AdminSuspiciousEventsPanel
            id="admin-suspicious-watch"
            events={suspiciousEvents}
            auditLogAvailable={kpis.auditLogAvailable}
          />

          <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" id="admin-audit-log">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-cyan" aria-hidden />
              <h2 className="font-display text-base font-semibold text-foreground">Audit / Security</h2>
            </div>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              Входы, действия админов, проверки практик, сертификаты и rate limit — без секретов и meta.
            </p>
            {auditFeed.length === 0 ? (
              <AdminEmptyState
                kind="no_audit"
                className="mt-4"
                description={
                  kpis.auditLogAvailable
                    ? undefined
                    : "Журнал аудита отключён (SECURITY_AUDIT_DB = 0). События не записываются."
                }
              />
            ) : (
              <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
                {auditFeed.map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs",
                      e.suspicious ? "border-warning/30 bg-warning/5" : "border-border/70 bg-muted/10",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{e.actionLabel}</span>
                      <AdminAuditSeverityBadge severity={e.severity} />
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {formatAt(e.at)} · {e.actorLabel}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-4 min-h-11 w-full">
              <Link href="/admin/profile">Полный security dashboard</Link>
            </Button>
          </SectionCard>

          <AdminExportPanel />
          <SystemStatusPanel data={system} />
        </aside>
      </div>
    </div>
  );
}
