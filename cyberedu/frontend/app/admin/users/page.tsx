import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Пользователи",
};

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
      <span className="typo-label text-[0.65rem]">{label}</span>
      <span className="wrap-break-word text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

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
                Учётные записи платформы. Колонка «Отчёт курса» — число строк в таблице{" "}
                <code className="rounded-md border border-border/80 bg-muted/80 px-1.5 py-0.5 font-mono text-xs text-foreground">
                  course_progress
                </code>
                , связанных с пользователем по внешнему ключу.
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
                <CardDescription className="text-muted-foreground">{rows.length} записей</CardDescription>
              </div>
              <Button asChild variant="primary" className="w-full shrink-0 sm:w-auto">
                <a href="/api/admin/users/export">Выгрузка отчёта (CSV)</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {rows.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6">Пользователей пока нет.</p>
            ) : (
              <AdminDualTable
                mobile={
                  <div className="space-y-4 p-4 sm:p-5">
                    {rows.map((r) => (
                      <div
                        key={r.id}
                        className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm ring-1 ring-secondary/[0.03]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{r.fullName}</p>
                            {r.role === "ADMIN" ? (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                ADMIN
                              </Badge>
                            ) : null}
                          </div>
                          <Button asChild variant="outline" size="sm" className="shrink-0">
                            <Link href={`/admin/users/${r.id}`}>Подробнее</Link>
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <MobileField label="Email" value={r.email} />
                          <MobileField label="Учебное заведение" value={r.educationalInstitution || "—"} />
                          <MobileField label="Группа" value={r.studyGroup} />
                          <MobileField label="Курс" value={r.studyCourseYear} />
                          <MobileField label="Специальность" value={r.specialty || "—"} />
                          <MobileField
                            label="Регистрация"
                            value={new Date(r.createdAt).toLocaleDateString("ru-RU")}
                          />
                          <MobileField
                            label="Прогресс"
                            value={r.role === "USER" ? `${r.overallProgressPercent}%` : "—"}
                          />
                          <MobileField label="Баллы" value={r.role === "USER" ? String(r.totalScore) : "—"} />
                          <MobileField
                            label="Отчёт курса"
                            value={String(r.courseProgressRowCount)}
                          />
                          <MobileField label="Сертификат" value={r.hasCertificate ? "Выдан" : "Нет"} />
                        </div>
                      </div>
                    ))}
                  </div>
                }
                desktop={
                  <table className="w-full min-w-[1280px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-linear-to-b from-muted/90 to-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3.5">ФИО</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5">Учебное заведение</th>
                        <th className="px-4 py-3.5">Группа</th>
                        <th className="px-4 py-3.5">Курс</th>
                        <th className="px-4 py-3.5">Специальность</th>
                        <th className="px-4 py-3.5">Регистрация</th>
                        <th className="px-4 py-3.5">Прогресс</th>
                        <th className="px-4 py-3.5">Баллы</th>
                        <th className="px-4 py-3.5 whitespace-normal">Отчёт курса</th>
                        <th className="px-4 py-3.5">Сертификат</th>
                        <th className="w-28 px-4 py-3.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-border/60 transition-colors odd:bg-card even:bg-muted/[0.18] hover:bg-primary/[0.04]"
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-foreground">{r.fullName}</div>
                            {r.role === "ADMIN" ? (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                ADMIN
                              </Badge>
                            ) : null}
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">{r.email}</td>
                          <td className="max-w-[200px] px-4 py-3.5 text-muted-foreground">{r.educationalInstitution}</td>
                          <td className="max-w-[100px] px-4 py-3.5 tabular-nums text-muted-foreground">{r.studyGroup}</td>
                          <td className="w-16 px-4 py-3.5 tabular-nums text-muted-foreground">{r.studyCourseYear}</td>
                          <td className="max-w-[160px] px-4 py-3.5 text-muted-foreground">{r.specialty}</td>
                          <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                            {r.role === "USER" ? `${r.overallProgressPercent}%` : "—"}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">{r.role === "USER" ? r.totalScore : "—"}</td>
                          <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{r.courseProgressRowCount}</td>
                          <td className="px-4 py-3.5">
                            {r.hasCertificate ? (
                              <span className="font-medium text-success">Выдан</span>
                            ) : (
                              <span className="text-muted-foreground">Нет</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/users/${r.id}`}>Подробнее</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
