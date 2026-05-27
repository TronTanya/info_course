import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BookOpen,
  ClipboardList,
  FlaskConical,
  Shield,
  Users,
} from "lucide-react";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import type { AdminLmsDashboardData } from "@/lib/admin-lms-dashboard";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionCard } from "@/components/ui/section-card";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityBadge(severity: string): "secondary" | "warning" | "danger" {
  if (severity === "high" || severity === "warn") return "warning";
  if (severity === "danger") return "danger";
  return "secondary";
}

export function AdminLmsDashboard({
  data,
  users,
}: {
  data: AdminLmsDashboardData;
  users: AdminUserListRow[];
}) {
  const { overview, difficult, submissionQueue, certificates, auditEvents } = data;

  return (
    <div className="space-y-8">
      <section aria-labelledby="admin-overview-heading">
        <h2 id="admin-overview-heading" className="sr-only">
          Обзор LMS
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <OverviewKpi label="Студентов" value={overview.totalStudents} hint="роль USER" />
          <OverviewKpi label="Активные" value={overview.activeStudents} hint="есть активность" tone="primary" />
          <OverviewKpi
            label="Ср. прогресс"
            value={`${overview.averageProgressPercent}%`}
            hint="по модулям курса"
          />
          <OverviewKpi
            label="Ср. балл тестов"
            value={overview.averageTestPercent != null ? `${overview.averageTestPercent}%` : "—"}
            hint="по попыткам"
          />
          <OverviewKpi label="Практики сданы" value={overview.practicesCompleted} hint="модулей с зачётом" />
          <OverviewKpi
            label="Сертификаты"
            value={overview.certificatesIssued}
            hint={`${overview.studentsCompletedCourse} завершили курс`}
            tone="success"
          />
        </div>
      </section>

      <SectionCard variant="lab" flushTitle className="overflow-x-clip" id="students">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Студенты</h2>
              <p className="text-sm text-muted-foreground">Прогресс, тесты, практика, сертификат</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">Полный список</Link>
          </Button>
        </div>
        <AdminUsersTable rows={users} embedded dashboardView />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard variant="default" flushTitle className="p-4 sm:p-6" id="difficult-topics">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-warning" aria-hidden />
            <h2 className="font-display text-base font-semibold text-foreground">Сложные темы</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Частые ошибки в тестах, низкое завершение модулей, застревания в практике.
          </p>

          <div className="mt-5 space-y-5">
            <DifficultBlock title="Вопросы с ошибками" empty="Нет накопленной статистики по ответам.">
              {difficult.questions.length === 0 ? null : (
                <ul className="space-y-2">
                  {difficult.questions.map((q) => (
                    <li key={q.questionId} className="rounded-lg border border-border/70 bg-muted/15 px-3 py-2 text-sm">
                      <p className="font-medium text-foreground">{q.questionText}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {q.moduleTitle} · неверно {q.wrongCount}
                        {q.gradedCount > 0 ? ` / ${q.gradedCount} проверено` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </DifficultBlock>

            <DifficultBlock title="Модули с низким завершением" empty="Все модули выше 70% завершения.">
              {difficult.modules.length === 0 ? null : (
                <ul className="space-y-2">
                  {difficult.modules.map((m) => (
                    <li key={m.moduleId}>
                      <Link
                        href={`/admin/modules/${m.moduleId}/edit`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/25 hover:bg-primary/5"
                      >
                        <span className="font-medium text-foreground">{m.title}</span>
                        <Badge variant={m.completionRatePercent < 40 ? "danger" : "warning"}>
                          {m.completionRatePercent}%
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </DifficultBlock>

            <DifficultBlock title="Практики — застревания" empty="Нет выраженных отклонений по сдачам.">
              {difficult.practices.length === 0 ? null : (
                <ul className="space-y-2">
                  {difficult.practices.map((p) => (
                    <li key={p.taskId} className="rounded-lg border border-border/70 px-3 py-2 text-sm">
                      <p className="font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.moduleTitle} · отклонено/ожидает {p.stuckRatePercent}% ({p.stuckCount}/{p.totalSubmissions})
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </DifficultBlock>
          </div>
        </SectionCard>

        <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" id="submissions-queue">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" aria-hidden />
              <h2 className="font-display text-base font-semibold text-foreground">Очередь проверки</h2>
            </div>
            {overview.pendingSubmissions > 0 ? (
              <Badge variant="warning">{overview.pendingSubmissions}</Badge>
            ) : null}
          </div>
          {submissionQueue.length === 0 ? (
            <EmptyState
              className="mt-4 py-8"
              title="Очередь пуста"
              description="Нет работ, ожидающих проверки. Новые отправки появятся после сдачи практики студентами."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/submissions">Все отправки</Link>
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 space-y-2">
              {submissionQueue.map((s) => (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="flex flex-col gap-1 rounded-xl border border-border/70 px-3 py-2.5 transition-colors hover:border-cyan/25 hover:bg-cyan/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.studentLabel}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.taskTitle} · {s.moduleTitle}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{s.statusLabel}</Badge>
                      <time className="text-2.5 tabular-nums text-muted-foreground">{formatAt(s.at)}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/admin/submissions?filter=pending">Все отправки</Link>
          </Button>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard variant="default" flushTitle className="p-4 sm:p-6" id="certificates">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-primary" aria-hidden />
            <h2 className="font-display text-base font-semibold text-foreground">Сертификаты</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetricCard label="Выдано" value={certificates.issuedTotal} hint="в реестре" />
            <MetricCard
              label="Готовы, не выданы"
              value={certificates.eligibleWithoutCert}
              hint="завершили курс"
            />
          </div>
          {certificates.recent.length === 0 ? (
            <EmptyState className="mt-4 py-6" title="Сертификатов нет" description="Появятся после выдачи студентам." />
          ) : (
            <ul className="mt-4 space-y-2">
              {certificates.recent.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-mono font-medium text-foreground">{c.certificateNumber}</p>
                    <p className="text-xs text-muted-foreground">{c.courseTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.hasPdf ? "success" : "warning"}>{c.hasPdf ? "PDF" : "нет PDF"}</Badge>
                    <Link href={c.verifyHref} className="text-xs font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
                      Проверка
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/admin/certificates">Реестр сертификатов</Link>
          </Button>
        </SectionCard>

        <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" id="audit">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-cyan" aria-hidden />
            <h2 className="font-display text-base font-semibold text-foreground">Журнал безопасности</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Последние события реестра (без PII в meta).</p>
          {auditEvents.length === 0 ? (
            <EmptyState
              className="mt-4 py-6"
              title="Событий пока нет"
              description="Аудит пишется в security_audit_log при действиях в системе."
            />
          ) : (
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {auditEvents.map((e) => (
                <li
                  key={e.id}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs",
                    e.sensitive ? "border-warning/30 bg-warning/5" : "border-border/70 bg-muted/10",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium text-foreground">{e.action}</span>
                    <Badge variant={severityBadge(e.severity)}>{e.severity}</Badge>
                    {e.sensitive ? (
                      <Badge variant="outline" className="text-2.5">
                        чувствительное
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {formatAt(e.at)}
                    {e.path ? ` · ${e.path}` : ""}
                    {e.actorId ? ` · ID ${e.actorId.slice(0, 8)}…` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="ghost" size="sm" className="mt-4">
            <Link href="/admin/profile">Открыть аудит</Link>
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}

function OverviewKpi({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "primary" | "success";
}) {
  const bar =
    tone === "success" ? "from-success/80" : tone === "primary" ? "from-primary/80" : "from-cyan/60";
  return (
    <article className={cn(cyber.adminKpi, "overflow-hidden rounded-2xl border pt-0")}>
      <div className={cn("h-1 w-full bg-linear-to-r via-accent/40 to-transparent", bar)} aria-hidden />
      <div className="px-4 pb-4 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="mt-0.5 text-2.75 text-muted-foreground">{hint}</p>
      </div>
    </article>
  );
}

function DifficultBlock({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children ? children : <p className="mt-2 text-sm text-muted-foreground">{empty}</p>}
    </div>
  );
}
