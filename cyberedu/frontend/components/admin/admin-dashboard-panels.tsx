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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";

const QUICK_ACTIONS = [
  { href: "/admin/users", label: "Пользователи", icon: Users, description: "Поиск и карточки" },
  { href: "/admin/modules", label: "Модули", icon: BookOpen, description: "Структура курса" },
  { href: "/admin/submissions?filter=pending", label: "Проверка работ", icon: ClipboardList, description: "Очередь отправок" },
  { href: "/admin/tests", label: "Тесты", icon: LayoutDashboard, description: "Контрольные" },
  { href: "/admin/practical-tasks", label: "Практика", icon: FlaskConical, description: "Лаборатории" },
  { href: "/api/admin/users/export", label: "CSV отчёт", icon: FileDown, description: "Выгрузка Excel" },
] as const;

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
        <Card
          key={t.label}
          interactive
          className="group relative overflow-hidden border-border/70 pt-0 ring-1 ring-primary/10 motion-reduce:hover:translate-y-0"
        >
          <div
            className={`h-1 w-full bg-linear-to-r from-primary/80 via-accent/60 to-primary/40 ${"warn" in t && t.warn ? "from-warning/80 via-warning/60" : ""}`}
            aria-hidden
          />
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-base font-semibold">{t.label}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">{t.hint}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">{t.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboardQuickActions() {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Быстрые действия</CardTitle>
        <CardDescription>Частые переходы без поиска в меню</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            const isExport = a.href.startsWith("/api/");
            return (
              <li key={a.href}>
                {isExport ? (
                  <a
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{a.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{a.description}</span>
                    </span>
                  </a>
                ) : (
                  <Link
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{a.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{a.description}</span>
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardContentOverview({ content }: { content: AdminDashboardExtended["content"] }) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Контент курса</CardTitle>
        <CardDescription>
          {content.courseTitle ? `Курс: ${content.courseTitle}` : "Курс не настроен в базе"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <MetricCard label="Модули" value={`${content.modulesActive}/${content.modulesTotal}`} hint="активных" />
        <MetricCard label="Лекции" value={content.lessonsTotal} hint="в системе" />
        <MetricCard label="Тесты" value={content.testsTotal} hint="по модулям" />
        <MetricCard label="Практика" value={content.practicalTasksTotal} hint="заданий" />
      </CardContent>
    </Card>
  );
}

export function AdminDashboardRecentActivity({ recent }: { recent: AdminDashboardExtended["recent"] }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-lg">Недавняя активность</CardTitle>
          <CardDescription>Последние отправки и регистрации</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/submissions">Все отправки</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState className="py-8" title="Пока нет событий" description="Активность появится после работы студентов." />
        ) : (
          <ul className="space-y-2">
            {recent.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-0.5 rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  <time className="text-[10px] tabular-nums text-muted-foreground sm:text-xs">
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
        )}
      </CardContent>
    </Card>
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
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Статус системы</CardTitle>
        <CardDescription>Базовые проверки конфигурации</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}
