import type { Metadata } from "next";
import Link from "next/link";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Пользователи",
};

export default async function AdminUsersPage() {
  const rows = await getAdminUserListRows();

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-r from-primary/[0.07] via-card to-cyan/[0.06] p-6 shadow-sm ring-1 ring-secondary/[0.06] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full bg-primary/12 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-cyan/10 blur-2xl" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0">
              <p className="typo-eyebrow text-primary">Администрирование</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Пользователи</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Учётные записи платформы. Поиск и фильтр по роли — в панели таблицы. Колонка «Отчёт курса» — число строк в{" "}
                <code className="rounded-md border border-border/80 bg-muted/80 px-1.5 py-0.5 font-mono text-xs text-foreground">
                  course_progress
                </code>
                .
              </p>
            </div>
            <Button asChild variant="primary" className="w-full shrink-0 shadow-md sm:mt-8 sm:w-auto">
              <a href="/api/admin/users/export">Скачать отчёт CSV</a>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 shadow-md ring-1 ring-secondary/[0.04]">
          <CardHeader className="border-b border-border/60 bg-muted/25 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg">Список</CardTitle>
                <CardDescription className="text-muted-foreground">{rows.length} записей в базе</CardDescription>
              </div>
              <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
                <Link href="/api/admin/users/export">Выгрузка CSV</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AdminUsersTable rows={rows} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
