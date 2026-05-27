import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Users,
  FileDown,
  Award,
  MessageSquare,
} from "lucide-react";
import type { AdminDashboardExtended, AdminDashboardStats } from "@/lib/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionCard } from "@/components/ui/section-card";

const QUICK_ACTIONS = [
  { href: "/admin/users", label: "Студенты", icon: Users, description: "Аккаунты и прогресс" },
  { href: "/admin/modules", label: "Модули", icon: BookOpen, description: "Структура курса" },
  { href: "/admin/submissions?filter=pending", label: "Проверка практик", icon: ClipboardList, description: "Очередь на оценку" },
  { href: "/admin/tests", label: "Тесты", icon: LayoutDashboard, description: "Вопросы и баллы" },
  { href: "/admin/practical-tasks", label: "Практика", icon: FlaskConical, description: "Задания модулей" },
  { href: "/api/admin/users/export", label: "Экспорт CSV", icon: FileDown, description: "Список студентов" },
] as const;

const quickActionTileClass =
  "flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border/70 bg-card px-3 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-muted/30";

function AdminQuickActionTile({
  href,
  label,
  description,
  icon: Icon,
  external,
}: {
  href: string;
  label: string;
  description: string;
  icon: (typeof QUICK_ACTIONS)[number]["icon"];
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="ce-admin-quick-action-icon flex size-9 shrink-0 items-center justify-center rounded-lg text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-pretty text-muted-foreground">{description}</span>
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} className={quickActionTileClass}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={quickActionTileClass}>
      {inner}
    </Link>
  );
}

export function AdminDashboardKpiGrid({ stats }: { stats: AdminDashboardStats }) {
  const tiles = [
    { label: "Пользователи", value: stats.totalUsers, hint: "Все учётные записи" },
    { label: "Активные студенты", value: stats.activeStudents, hint: "Есть активность по курсу" },
    { label: "Завершили курс", value: stats.studentsCompletedCourse, hint: "Все модули пройдены" },
    {
      label: "На проверке",
      value: stats.pendingWorkCount,
      hint: "Практика в очереди",
      warn: stats.pendingWorkCount > 0,
    },
    { label: "Сертификаты", value: stats.certificatesIssuedTotal, hint: "Выдано документов" },
    { label: "Отзывы", value: stats.publishedReviewsCount, hint: "Опубликовано на сайте" },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-[1920px]:grid-cols-6">
      {tiles.map((t) => (
        <article
          key={t.label}
          className={cn(
            cyber.adminKpi,
            "group overflow-hidden rounded-2xl border pt-0 motion-reduce:hover:translate-y-0",
          )}
        >
          <div
            className={cn("ce-polish-stat-bar", "warn" in t && t.warn && "ce-polish-stat-bar--warn")}
            aria-hidden
          />
          <div className="space-y-1 px-5 pb-5 pt-5">
            <p className="text-base font-semibold text-foreground">{t.label}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
            <p className="pt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">{t.value}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AdminDashboardQuickActions() {
  return (
    <SectionCard
      variant="default"
      title="Быстрые действия"
      description="Частые разделы админки"
      flushTitle
      className="min-w-0"
    >
      <ul className="ce-admin-quick-actions grid list-none grid-cols-1 gap-2 p-0">
        {QUICK_ACTIONS.map((a) => (
          <li key={a.href} className="min-w-0">
            <AdminQuickActionTile
              href={a.href}
              label={a.label}
              description={a.description}
              icon={a.icon}
              external={a.href.startsWith("/api/")}
            />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export function AdminDashboardContentOverview({ content }: { content: AdminDashboardExtended["content"] }) {
  return (
    <SectionCard
      variant="lab"
      title="Контент курса"
      description={content.courseTitle ? `Курс: ${content.courseTitle}` : "Курс не настроен в базе"}
      flushTitle
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label="Модули" value={`${content.modulesActive}/${content.modulesTotal}`} hint="активных" />
        <MetricCard label="Лекции" value={content.lessonsTotal} hint="в системе" />
        <MetricCard label="Тесты" value={content.testsTotal} hint="по модулям" />
        <MetricCard label="Практика" value={content.practicalTasksTotal} hint="заданий" />
      </div>
    </SectionCard>
  );
}

export function AdminDashboardRecentActivity({ recent }: { recent: AdminDashboardExtended["recent"] }) {
  return (
    <SectionCard variant="lab" title="Недавняя активность" description="Последние отправки и регистрации" flushTitle>
      <div className="mb-4 flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/submissions">Все отправки</Link>
        </Button>
      </div>
        <UiStatePanel
          state={recent.length === 0 ? "empty" : "idle"}
          className="py-8"
          title="Пока нет событий"
          description="Активность появится после работы студентов."
        >
          <ul className="space-y-2">
            {recent.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-0.5 rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  <time className="text-2.5 tabular-nums text-muted-foreground sm:text-xs">
                    {new Date(item.at).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </UiStatePanel>
    </SectionCard>
  );
}

export function AdminDashboardSystemStatus({
  systemOk,
  pendingWork,
}: {
  systemOk: boolean;
  pendingWork: number;
}) {
  return (
    <SectionCard variant="lab" title="Статус системы" description="Базовые проверки конфигурации" flushTitle>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
          <span className="text-sm text-foreground">Курс в БД</span>
          <Badge variant={systemOk ? "success" : "danger"}>{systemOk ? "OK" : "Нет курса"}</Badge>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
          <span className="text-sm text-foreground">Очередь проверки</span>
          <Badge variant={pendingWork > 0 ? "warning" : "secondary"}>
            {pendingWork > 0 ? `${pendingWork} работ` : "Пусто"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/certificates">
              <Award className="size-3.5" aria-hidden />
              Сертификаты
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/reviews">
              <MessageSquare className="size-3.5" aria-hidden />
              Отзывы
            </Link>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
