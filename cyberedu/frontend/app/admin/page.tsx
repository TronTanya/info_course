import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminDashboardChartsLazy } from "@/components/admin/admin-dashboard-charts-lazy";
import { getAdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import { getAdminDashboardStats } from "@/lib/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export const metadata: Metadata = {
  title: "Админка · Обзор",
};

export default async function AdminHomePage() {
  const [s, charts] = await Promise.all([getAdminDashboardStats(), getAdminDashboardChartsData()]);

  const tiles = [
    { title: "Всего пользователей", value: s.totalUsers, hint: "Все учётные записи в системе" },
    { title: "Активных студентов", value: s.activeStudents, hint: "Роль USER с активностью по курсу, тестам или практике" },
    { title: "Завершили курс", value: s.studentsCompletedCourse, hint: "Все активные модули основного курса отмечены завершёнными" },
    { title: "Работ на проверке", value: s.pendingWorkCount, hint: "Отправки: ожидают проверки или на доработке" },
    { title: "Выдано сертификатов", value: s.certificatesIssuedTotal, hint: "Записей в реестре сертификатов" },
    { title: "Опубликованных отзывов", value: s.publishedReviewsCount, hint: "Отзывы с публикацией на сайте" },
  ] as const;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="ce-admin-dash-hero hero-glow isolate p-6 sm:p-8">
          <div className="relative z-10">
            <p className="typo-eyebrow text-primary">CyberEdu · админ</p>
            <h1 className="typo-h1 mt-2 sm:text-3xl">Панель администратора</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Доступ только для роли ADMIN: проверка в middleware и в layout. Поле{" "}
              <code className="rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-xs text-foreground/90">
                passwordHash
              </code>{" "}
              нигде не запрашивается и не показывается.
            </p>
          </div>
        </div>

        <Card interactive className="border-border/70 shadow-sm ring-1 ring-primary/10">
          <CardHeader className="pb-2 sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <CardTitle className="text-lg">Отчёты</CardTitle>
              <CardDescription className="mt-1.5 max-w-xl text-sm">
                Выгрузка списка пользователей в CSV (ФИО, email, роль, учебное заведение, группа, курс, специальность,
                регистрация, прогресс, баллы, сертификат, отчёт course_progress). Файл с разделителем «;» и кодировкой
                UTF-8 для Excel.
              </CardDescription>
            </div>
            <Button asChild variant="primary" className="mt-3 shrink-0 sm:mt-0">
              <a href="/api/admin/users/export">Скачать отчёт CSV</a>
            </Button>
          </CardHeader>
          <CardContent className="pb-5 pt-0">
            <p className="text-xs text-muted-foreground">
              Тот же файл доступен на странице{" "}
              <Link href="/admin/users" className="font-medium text-primary underline-offset-4 hover:underline">
                Пользователи
              </Link>
              .
            </p>
          </CardContent>
        </Card>
        <AdminDashboardChartsLazy data={charts} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-[1920px]:grid-cols-4">
          {tiles.map((t) => (
            <Card
              key={t.title}
              interactive
              className="group relative overflow-hidden border-border/70 pt-0 shadow-(--shadow-glow) ring-1 ring-primary/10 motion-reduce:hover:translate-y-0"
            >
              <div className="h-1 w-full bg-linear-to-r from-primary/80 via-accent/60 to-primary/40 transition-opacity group-hover:opacity-100" aria-hidden />
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-lg font-semibold tracking-tight">{t.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{t.hint}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">{t.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
