import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SubmissionStatus } from "@prisma/client";
import { Calendar, GraduationCap, Mail, MapPin, School, Shield, UserCircle } from "lucide-react";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminUserDetail } from "@/lib/admin-user-detail";
import { parseProfileEducationalInstitution } from "@/lib/profile-school-parse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { SectionCard } from "@/components/ui/section-card";

type Props = { params: Promise<{ id: string }> };

function submissionStatusRu(s: SubmissionStatus): string {
  const m: Record<SubmissionStatus, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "Нужны правки",
  };
  return m[s] ?? s;
}

function userInitials(fullName: string, email: string) {
  const t = fullName.trim();
  if (t) {
    const w = t.split(/\s+/).filter(Boolean);
    if (w.length >= 2) return `${w[0]?.[0] ?? ""}${w[1]?.[0] ?? ""}`.toUpperCase();
    if (w[0] && w[0].length >= 2) return w[0].slice(0, 2).toUpperCase();
    if (w[0]) return `${w[0][0] ?? "?"}`.toUpperCase();
  }
  const e = email.trim();
  return e.length >= 2 ? e.slice(0, 2).toUpperCase() : "?";
}

function profileFieldRow(icon: ReactNode, label: string, value: string) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const d = await getAdminUserDetail(id);
  if (!d) return { title: "Пользователь" };
  const name = d.profile?.fullName ?? d.user.email;
  return { title: `${name} · Админка` };
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const d = await getAdminUserDetail(id);
  if (!d) notFound();

  const school = d.profile
    ? parseProfileEducationalInstitution(
        d.profile.educationalInstitution.trim() === "—" ? "" : d.profile.educationalInstitution.trim(),
      )
    : null;

  const displayName = d.profile?.fullName ?? d.user.email;
  const initials = userInitials(displayName, d.user.email);
  const avatarUrl = d.profile?.avatarUrl?.trim() || null;
  const memberSince = new Date(d.user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" size="sm" className="border-border/80 bg-card/80 shadow-sm">
            <Link href="/admin/users">← К списку пользователей</Link>
          </Button>
        </div>

        <header className="ce-user-profile-hero p-6 sm:p-8 lg:p-10">
          <div className="ce-user-profile-hero-blob" aria-hidden />
          <div className="ce-user-profile-hero-grid" aria-hidden />
          <div className="ce-user-profile-hero-vignette" aria-hidden />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="ce-profile-avatar-ring">
                  <div className="overflow-hidden rounded-[1.22rem] bg-linear-to-br from-muted/90 to-card ring-1 ring-border/50">
                    <div className="relative flex size-28 items-center justify-center bg-linear-to-br from-primary/10 via-card to-cyan/8 text-2xl font-bold tracking-tight text-primary sm:size-35 sm:text-3xl">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL из профиля
                        <img src={avatarUrl} alt={`Аватар студента: ${displayName}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-4xl bg-linear-to-br from-cyan/16 via-transparent to-primary/10 opacity-90 blur-2xl"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge variant={d.user.role === "ADMIN" ? "success" : "secondary"} className="gap-1 font-semibold">
                    {d.user.role === "ADMIN" ? (
                      <>
                        <Shield className="size-3.5" aria-hidden />
                        Администратор
                      </>
                    ) : (
                      <>
                        <UserCircle className="size-3.5" aria-hidden />
                        Студент
                      </>
                    )}
                  </Badge>
                  <span className="typo-caption tabular-nums text-muted-foreground">Регистрация: {memberSince}</span>
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{displayName}</h1>
                <p className="inline-flex max-w-full items-center justify-center rounded-xl border border-border/65 bg-background/55 px-3 py-2 font-mono text-xs text-muted-foreground shadow-inner backdrop-blur-sm sm:justify-start">
                  {d.user.email}
                </p>
                {d.courseProgress ? (
                  <p className="text-sm text-muted-foreground">
                    Прогресс по курсу:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {d.courseProgress.overallProgressPercent}%
                    </span>
                    {" · "}
                    баллы:{" "}
                    <span className="font-semibold tabular-nums text-foreground">{d.courseProgress.totalScore}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <SectionCard
          variant="lab"
          title="Данные профиля"
          description="Карточка учётной записи и анкеты в системе."
          className="space-y-3"
        >
            {d.profile && school ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {profileFieldRow(<School className="size-4" />, "Учебное заведение", school.institution)}
                {profileFieldRow(<GraduationCap className="size-4" />, "Группа", school.group)}
                {profileFieldRow(<Calendar className="size-4" />, "Курс", school.courseYear)}
                {profileFieldRow(<MapPin className="size-4" />, "Город", d.profile.city)}
                {profileFieldRow(<GraduationCap className="size-4" />, "Специальность", d.profile.specialty)}
                {profileFieldRow(<Calendar className="size-4" />, "Дата рождения", d.profile.birthDate)}
                {profileFieldRow(<Mail className="size-4" />, "Регистрация", new Date(d.user.createdAt).toLocaleString("ru-RU"))}
                {d.user.emailVerified
                  ? profileFieldRow(
                      <Mail className="size-4" />,
                      "Email подтверждён",
                      new Date(d.user.emailVerified).toLocaleString("ru-RU"),
                    )
                  : null}
              </div>
            ) : d.profile ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {profileFieldRow(<MapPin className="size-4" />, "Город", d.profile.city)}
                {profileFieldRow(<GraduationCap className="size-4" />, "Специальность", d.profile.specialty)}
                {profileFieldRow(<Calendar className="size-4" />, "Дата рождения", d.profile.birthDate)}
                {profileFieldRow(<Mail className="size-4" />, "Регистрация", new Date(d.user.createdAt).toLocaleString("ru-RU"))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Профиль не заполнен.</p>
            )}
        </SectionCard>

        <SectionCard title="Интересы" className="text-sm text-foreground">
            {d.profile?.interests?.trim() ? (
              <p className="whitespace-pre-wrap">{d.profile.interests}</p>
            ) : (
              <p className="text-muted-foreground">Не указаны.</p>
            )}
        </SectionCard>

        <AdminTableCard
          title="Прогресс по модулям"
          description={`${d.course ? d.course.title : "Курс не найден"}${
            d.courseProgress
              ? ` · всего ${d.courseProgress.overallProgressPercent}% модулей · баллы: ${d.courseProgress.totalScore}`
              : ""
          }`}
        >
            {!d.courseProgress ? (
              <p className="px-4 py-4 text-sm text-muted-foreground sm:px-0">
                {d.user.role === "ADMIN"
                  ? "Для учётных записей ADMIN прогресс по курсу не отображается."
                  : "Нет данных о прогрессе."}
              </p>
            ) : (
              <AdminDualTable
                mobile={
                  <div className="divide-y divide-border border-t border-border">
                    {d.courseProgress.modules.map((row) => (
                      <div key={row.module.id} className="space-y-2 p-4">
                        <p className="font-medium text-foreground">{row.module.title}</p>
                        <div className="grid gap-1 text-sm text-muted-foreground">
                          <p>Доступ: {row.unlocked ? "Да" : "Нет"}</p>
                          <p>Прогресс шагов: {row.progressPercent}%</p>
                          <p>Баллы: {row.score}</p>
                          <p>Завершён: {row.moduleCompleted ? "Да" : "Нет"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                }
                desktop={
                  <table className="w-full min-w-160 border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                        <th className="py-2 pr-4">Модуль</th>
                        <th className="py-2 pr-4">Доступ</th>
                        <th className="py-2 pr-4">Прогресс шагов</th>
                        <th className="py-2 pr-4">Баллы</th>
                        <th className="py-2">Завершён</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.courseProgress.modules.map((row) => (
                        <tr key={row.module.id} className="border-b border-border/70">
                          <td className="py-2 pr-4 font-medium">{row.module.title}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.unlocked ? "Да" : "Нет"}</td>
                          <td className="py-2 pr-4 tabular-nums">{row.progressPercent}%</td>
                          <td className="py-2 pr-4 tabular-nums">{row.score}</td>
                          <td className="py-2">{row.moduleCompleted ? "Да" : "Нет"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              />
            )}
        </AdminTableCard>

        <AdminTableCard title="Результаты тестов" description="Последние попытки">
            {d.testAttempts.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground sm:px-0">Попыток нет.</p>
            ) : (
              <AdminDualTable
                mobile={
                  <div className="divide-y divide-border border-t border-border">
                    {d.testAttempts.map((t) => (
                      <div key={t.id} className="space-y-2 p-4">
                        <p className="font-medium text-foreground">{t.testTitle}</p>
                        <p className="text-sm text-muted-foreground">{t.moduleTitle}</p>
                        <p className="text-sm">
                          Баллы:{" "}
                          <span className="tabular-nums">
                            {t.score} / {t.maxScore}
                          </span>{" "}
                          · {t.passed ? "Зачёт" : "Не зачёт"}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {new Date(t.createdAt).toLocaleString("ru-RU")}
                        </p>
                      </div>
                    ))}
                  </div>
                }
                desktop={
                  <table className="w-full min-w-140 border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                        <th className="py-2 pr-4">Тест</th>
                        <th className="py-2 pr-4">Модуль</th>
                        <th className="py-2 pr-4">Баллы</th>
                        <th className="py-2 pr-4">Статус</th>
                        <th className="py-2">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.testAttempts.map((t) => (
                        <tr key={t.id} className="border-b border-border/70">
                          <td className="py-2 pr-4">{t.testTitle}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{t.moduleTitle}</td>
                          <td className="py-2 pr-4 tabular-nums">
                            {t.score} / {t.maxScore}
                          </td>
                          <td className="py-2 pr-4">{t.passed ? "Зачёт" : "Не зачёт"}</td>
                          <td className="py-2 tabular-nums text-muted-foreground">
                            {new Date(t.createdAt).toLocaleString("ru-RU")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              />
            )}
        </AdminTableCard>

        <AdminTableCard title="Практические работы">
            {d.submissions.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground sm:px-0">Отправок нет.</p>
            ) : (
              <AdminDualTable
                mobile={
                  <div className="divide-y divide-border border-t border-border">
                    {d.submissions.map((s) => (
                      <div key={s.id} className="space-y-2 p-4">
                        <p className="font-medium text-foreground">{s.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">{s.moduleTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {submissionStatusRu(s.status)} · баллы: {s.score ?? "—"} ·{" "}
                          {[s.hasText && "текст", s.hasFile && "файл"].filter(Boolean).join(", ") || "—"}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {new Date(s.createdAt).toLocaleString("ru-RU")}
                        </p>
                      </div>
                    ))}
                  </div>
                }
                desktop={
                  <table className="w-full min-w-180 border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                        <th className="py-2 pr-4">Задание</th>
                        <th className="py-2 pr-4">Модуль</th>
                        <th className="py-2 pr-4">Статус</th>
                        <th className="py-2 pr-4">Баллы</th>
                        <th className="py-2 pr-4">Форма</th>
                        <th className="py-2">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.submissions.map((s) => (
                        <tr key={s.id} className="border-b border-border/70">
                          <td className="py-2 pr-4">{s.taskTitle}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{s.moduleTitle}</td>
                          <td className="py-2 pr-4">{submissionStatusRu(s.status)}</td>
                          <td className="py-2 pr-4 tabular-nums">{s.score ?? "—"}</td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {[s.hasText && "текст", s.hasFile && "файл"].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="py-2 tabular-nums text-muted-foreground">
                            {new Date(s.createdAt).toLocaleString("ru-RU")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              />
            )}
        </AdminTableCard>

        <SectionCard title="Сертификаты" className="space-y-4 text-sm">
            {d.certificates.length === 0 ? (
              <p className="text-muted-foreground">Сертификат не выдавался.</p>
            ) : (
              d.certificates.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="font-medium text-foreground">{c.courseTitle}</p>
                  <p className="mt-1 text-muted-foreground">Номер: {c.certificateNumber}</p>
                  <p className="text-muted-foreground">Выдан: {new Date(c.issuedAt).toLocaleString("ru-RU")}</p>
                  <p className="text-xs text-muted-foreground">Код проверки: {c.verificationCode}</p>
                  {c.pdfUrl ? (
                    <p className="mt-2">
                      <a className="text-primary underline-offset-4 hover:underline" href={c.pdfUrl}>
                        PDF
                      </a>
                    </p>
                  ) : null}
                </div>
              ))
            )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
