import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Database,
  FlaskConical,
  LayoutDashboard,
  Server,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AdminSecurityDashboardData } from "@/lib/admin-security-dashboard";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { SectionCard } from "@/components/ui/section-card";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "content", label: "Content" },
  { id: "analytics", label: "Analytics" },
  { id: "security", label: "Security" },
] as const;

function KpiTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const bar =
    tone === "success"
      ? "from-success/80"
      : tone === "warning"
        ? "from-warning/80"
        : tone === "danger"
          ? "from-danger/80"
          : "from-primary/80";

  return (
    <article className={cn(cyber.adminKpi, "relative overflow-hidden rounded-2xl border pt-0")}>
      <div className={cn("h-1 w-full bg-linear-to-r via-accent/50 to-transparent", bar)} aria-hidden />
      <div className="space-y-1 px-5 pb-5 pt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </article>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <Badge variant={ok ? "success" : "danger"} className="font-mono text-[10px] uppercase">
      {ok ? "OK" : "FAIL"}
    </Badge>
  );
}

export function AdminSecurityDashboard({
  data,
  users,
}: {
  data: AdminSecurityDashboardData;
  users: AdminUserListRow[];
}) {
  const { overview, system } = data;
  const maxActivity = Math.max(1, ...data.activityByDay.map((d) => d.count));

  return (
    <div className="ce-admin-security space-y-10">
      <nav
        className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card/60 p-2"
        aria-label="Разделы панели"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#admin-${s.id}`}
            className="rounded-xl px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="admin-overview" className="scroll-mt-24 space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Overview</p>
            <h2 className="font-display text-xl font-semibold text-foreground">Состояние платформы</h2>
          </div>
          <Badge variant={system.appStatus === "ok" ? "success" : "warning"} className="gap-1">
            <Shield className="size-3" aria-hidden />
            {system.appStatus === "ok" ? "Operational" : "Degraded"}
          </Badge>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <KpiTile label="Пользователи" value={overview.totalUsers} hint="Все учётные записи" />
          <KpiTile label="Активные студенты" value={overview.activeStudents} hint="Есть активность" />
          <KpiTile
            label="Завершили курс"
            value={overview.studentsCompletedCourse}
            hint="Все модули"
            tone="success"
          />
          <KpiTile
            label="Средний прогресс"
            value={`${overview.averageProgressPercent}%`}
            hint="По активным модулям"
          />
          <KpiTile label="Практика" value={overview.practiceSubmissionsTotal} hint="Отправок (не черновик)" />
          <KpiTile
            label="Тесты"
            value={
              overview.testPassRatePercent != null
                ? `${overview.testPassRatePercent}%`
                : "—"
            }
            hint={`${overview.testAttemptsTotal} попыток · pass rate`}
          />
        </div>
      </section>

      <section id="admin-users" className="scroll-mt-24 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">User management</p>
            <h2 className="font-display text-xl font-semibold text-foreground">Пользователи</h2>
            <p className="mt-1 text-sm text-muted-foreground">Поиск, фильтры по роли и прогрессу, действия в меню строки.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">
              <Users className="size-3.5" aria-hidden />
              Все пользователи
            </Link>
          </Button>
        </header>
        <AdminTableCard className="overflow-hidden">
          <AdminUsersTable rows={users} embedded />
        </AdminTableCard>
      </section>

      <section id="admin-content" className="scroll-mt-24 space-y-4">
        <header>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Content management</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Контент курса</h2>
        </header>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {data.content.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-4 transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-card"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {c.label === "Модули" ? (
                    <BookOpen className="size-4" aria-hidden />
                  ) : c.label === "Лекции" ? (
                    <LayoutDashboard className="size-4" aria-hidden />
                  ) : c.label === "Тесты" ? (
                    <ClipboardList className="size-4" aria-hidden />
                  ) : (
                    <FlaskConical className="size-4" aria-hidden />
                  )}
                </span>
                <span className="mt-3 font-semibold text-foreground">{c.label}</span>
                <span className="mt-1 text-2xl font-bold tabular-nums text-primary">{c.count}</span>
                <span className="mt-1 text-xs text-muted-foreground">{c.description}</span>
                <span className="mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Управление →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/submissions?filter=pending">Очередь проверки</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/modules/new">Новый модуль</Link>
          </Button>
        </div>
      </section>

      <section id="admin-analytics" className="scroll-mt-24 space-y-4">
        <header>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Analytics</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Аналитика</h2>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            variant="lab"
            title={
              <span className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" aria-hidden />
                Популярные модули
              </span>
            }
            description="Активность по шагам прогресса"
            className="space-y-3"
          >
              {data.popularModules.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет данных</p>
              ) : (
                data.popularModules.map((m) => (
                  <div key={m.moduleId} className="space-y-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-medium text-foreground">
                        MOD-{String(m.orderNumber).padStart(2, "0")} · {m.title}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{m.activityCount}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.round((m.activityCount / data.popularModules[0]!.activityCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
          </SectionCard>

          <SectionCard
            variant="lab"
            title={
              <span className="flex items-center gap-2">
                <Activity className="size-4 text-cyan" aria-hidden />
                Активность по дням
              </span>
            }
            description="14 дней: регистрации, тесты, практика"
          >
              <ul className="flex h-32 items-end gap-1">
                {data.activityByDay.map((d) => (
                  <li key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all"
                      style={{ height: `${Math.max(4, (d.count / maxActivity) * 100)}%` }}
                      title={`${d.count} событий`}
                    />
                    <span className="hidden text-[9px] text-muted-foreground sm:block">{d.label}</span>
                  </li>
                ))}
              </ul>
          </SectionCard>

          <SectionCard variant="lab" title="Сложные тесты" description="Низкий % прохождений (≥3 попыток)" className="space-y-2">
              {data.hardTests.length === 0 ? (
                <p className="text-sm text-muted-foreground">Недостаточно попыток</p>
              ) : (
                data.hardTests.map((t) => (
                  <div
                    key={t.testId}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.moduleTitle}</p>
                    </div>
                    <Badge variant={t.passRatePercent < 50 ? "danger" : "warning"} className="shrink-0 tabular-nums">
                      {t.passRatePercent}%
                    </Badge>
                  </div>
                ))
              )}
          </SectionCard>

          <SectionCard variant="lab" title="Высокий % ошибок" description="Практика со статусом «Отклонено»" className="space-y-2">
              {data.failureTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет отклонённых работ</p>
              ) : (
                data.failureTasks.map((t) => (
                  <div
                    key={t.taskId}
                    className="flex items-center justify-between gap-2 rounded-xl border border-danger/20 bg-danger/[0.04] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.moduleTitle}</p>
                    </div>
                    <Badge variant="danger" className="shrink-0 tabular-nums">
                      {t.failureRatePercent}%
                    </Badge>
                  </div>
                ))
              )}
          </SectionCard>
        </div>
      </section>

      <section id="admin-security" className="scroll-mt-24 space-y-4">
        <header>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Security</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Система и безопасность</h2>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            variant="lab"
            title={
              <span className="flex items-center gap-2">
                <Server className="size-4" aria-hidden />
                Статус приложения
              </span>
            }
            className="space-y-3"
          >
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm">
                  <Database className="size-4 text-muted-foreground" aria-hidden />
                  PostgreSQL
                </span>
                <StatusBadge ok={system.database === "ok"} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
                <span className="text-sm">Redis</span>
                <Badge
                  variant={
                    system.redis === "ok" ? "success" : system.redis === "skipped" ? "secondary" : "danger"
                  }
                  className="font-mono text-[10px] uppercase"
                >
                  {system.redis}
                </Badge>
              </div>
              {system.warnings.length > 0 ? (
                <ul className="space-y-2 rounded-xl border border-warning/30 bg-warning/[0.06] p-3">
                  {system.warnings.map((w) => (
                    <li key={w} className="flex gap-2 text-sm text-warning">
                      <AlertTriangle className="size-4 shrink-0" aria-hidden />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-success">Предупреждений нет</p>
              )}
              <Button asChild variant="outline" size="sm">
                <a href="/api/health" target="_blank" rel="noopener noreferrer">
                  API health JSON
                </a>
              </Button>
          </SectionCard>

          <SectionCard variant="lab" title="Последние события" description="Отклонения, неуспешные тесты, ошибки отчётов">
              {system.issues.length === 0 ? (
                <p className="text-sm text-muted-foreground">Событий нет</p>
              ) : (
                <ul className="space-y-2">
                  {system.issues.map((issue) => (
                    <li key={issue.id}>
                      {issue.href ? (
                        <Link
                          href={issue.href}
                          className={cn(
                            "block rounded-xl border px-3 py-2.5 transition-colors hover:bg-muted/40",
                            issue.severity === "danger" ? "border-danger/25" : "border-warning/25",
                          )}
                        >
                          <IssueRow issue={issue} />
                        </Link>
                      ) : (
                        <div
                          className={cn(
                            "rounded-xl border px-3 py-2.5",
                            issue.severity === "danger" ? "border-danger/25" : "border-warning/25",
                          )}
                        >
                          <IssueRow issue={issue} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
          </SectionCard>
        </div>
      </section>
    </div>
  );
}

function IssueRow({ issue }: { issue: AdminSecurityDashboardData["system"]["issues"][number] }) {
  return (
    <>
      <p className="text-sm font-medium text-foreground">{issue.title}</p>
      <p className="text-xs text-muted-foreground">{issue.subtitle}</p>
      <time className="mt-1 block text-[10px] tabular-nums text-muted-foreground">
        {new Date(issue.at).toLocaleString("ru-RU")}
      </time>
    </>
  );
}
