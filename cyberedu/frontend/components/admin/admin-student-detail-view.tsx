import type { ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  LayoutList,
  Mail,
  MapPin,
  School,
  Shield,
  UserCircle,
} from "lucide-react";
import { AdminIssueCertificateForm } from "@/components/admin/admin-issue-certificate-form";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import {
  ADMIN_STUDENT_SECTION,
  studentSubmissionsQueueHref,
  submissionStatusLabelRu,
} from "@/lib/admin-student-detail-logic";
import type { AdminUserDetail } from "@/lib/admin-user-detail";
import { parseProfileEducationalInstitution } from "@/lib/profile-school-parse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";

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

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function passedBadge(passed: boolean) {
  return (
    <Badge variant={passed ? "success" : "warning"} className="text-[10px]">
      {passed ? "Зачёт" : "Не зачёт"}
    </Badge>
  );
}

export function AdminStudentDetailView({ data }: { data: AdminUserDetail }) {
  const displayName = data.profile?.fullName ?? data.user.email;
  const initials = userInitials(displayName, data.user.email);
  const avatarUrl = data.profile?.avatarUrl?.trim() || null;
  const isStudent = data.user.role === "USER";
  const memberSince = new Date(data.user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const school = data.profile
    ? parseProfileEducationalInstitution(
        data.profile.educationalInstitution.trim() === "—" ? "" : data.profile.educationalInstitution.trim(),
      )
    : null;

  const progressPct = data.courseProgress?.overallProgressPercent ?? 0;

  return (
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant={data.user.role === "ADMIN" ? "success" : "secondary"} className="gap-1 font-semibold">
                  {data.user.role === "ADMIN" ? (
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
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {displayName}
              </h1>
              <p className="inline-flex max-w-full items-center justify-center rounded-xl border border-border/65 bg-background/55 px-3 py-2 font-mono text-xs text-muted-foreground shadow-inner backdrop-blur-sm sm:justify-start">
                <Mail className="mr-2 size-3.5 shrink-0" aria-hidden />
                {data.user.email}
              </p>
              {isStudent && data.courseProgress ? (
                <div className="mx-auto max-w-md space-y-2 sm:mx-0">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Общий прогресс</span>
                    <span className="font-semibold tabular-nums text-foreground">{progressPct}%</span>
                  </div>
                  <ProgressBar value={progressPct} max={100} />
                  <p className="text-xs text-muted-foreground">
                    Баллы по курсу:{" "}
                    <span className="tabular-nums font-medium text-foreground">{data.courseProgress.totalScore}</span>
                    {data.course ? ` · ${data.course.title}` : null}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isStudent ? (
        <nav
          aria-label="Действия администратора"
          className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card/50 p-3 sm:p-4"
        >
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={`#${ADMIN_STUDENT_SECTION.modules}`}>
              <LayoutList className="size-4" aria-hidden />
              Посмотреть прогресс
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={studentSubmissionsQueueHref(data.user.id)}>
              <ClipboardList className="size-4" aria-hidden />
              Открыть отправки
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={`#${ADMIN_STUDENT_SECTION.certificates}`}>
              <Award className="size-4" aria-hidden />
              Сертификат
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="min-h-11">
            <Link href="/admin/certificates">Реестр сертификатов</Link>
          </Button>
        </nav>
      ) : null}

      {isStudent && data.recentActivity.length > 0 ? (
        <SectionCard
          id={ADMIN_STUDENT_SECTION.activity}
          variant="lab"
          title="Недавняя активность"
          description="Агрегат попыток тестов, отправок практики и выдачи сертификата. Без текстов ответов и ключей проверки."
          className="scroll-mt-24"
        >
          <ul className="space-y-2">
            {data.recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-border/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  <time className="mt-1 block text-[11px] tabular-nums text-muted-foreground" dateTime={item.at}>
                    {formatAt(item.at)}
                  </time>
                </div>
                {item.href ? (
                  <Button asChild size="sm" variant="secondary" className="min-h-10 shrink-0">
                    <Link href={item.href}>
                      {item.kind === "practice" ? "Проверка" : "Открыть"}
                      <ExternalLink className="ml-1 size-3.5" aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {data.profile ? (
        <SectionCard variant="default" title="Анкета" description="Данные профиля для администрирования.">
          {school ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {profileFieldRow(<School className="size-4" />, "Учебное заведение", school.institution)}
              {profileFieldRow(<GraduationCap className="size-4" />, "Группа", school.group)}
              {profileFieldRow(<Calendar className="size-4" />, "Курс", school.courseYear)}
              {profileFieldRow(<MapPin className="size-4" />, "Город", data.profile.city)}
              {profileFieldRow(<GraduationCap className="size-4" />, "Специальность", data.profile.specialty)}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profileFieldRow(<MapPin className="size-4" />, "Город", data.profile.city)}
              {profileFieldRow(<GraduationCap className="size-4" />, "Специальность", data.profile.specialty)}
            </div>
          )}
        </SectionCard>
      ) : null}

      <div id={ADMIN_STUDENT_SECTION.modules} className="scroll-mt-24">
      <AdminTableCard
        title="Модули"
        description={
          data.courseProgress
            ? `${data.course?.title ?? "Курс"} · ${data.courseProgress.overallProgressPercent}% · ${data.courseProgress.totalScore} б.`
            : "Прогресс по курсу"
        }
      >
        {!data.courseProgress ? (
          <p className="px-4 py-4 text-sm text-muted-foreground sm:px-0">
            {data.user.role === "ADMIN" ? "Для ADMIN прогресс курса не отображается." : "Нет данных о прогрессе."}
          </p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border border-t border-border">
                {data.courseProgress.modules.map((row) => (
                  <AdminMobileCard key={row.module.id} className="space-y-3">
                    <p className="font-medium text-foreground">{row.module.title}</p>
                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <p>Шаги: {row.progressPercent}%</p>
                      <p>Баллы: {row.score}</p>
                      <p>Завершён: {row.moduleCompleted ? "Да" : "Нет"}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="min-h-10 w-full">
                      <Link href={`/admin/modules/${row.module.id}/edit`}>Открыть модуль</Link>
                    </Button>
                  </AdminMobileCard>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="py-2 pr-4">Модуль</th>
                    <th className="py-2 pr-4">Доступ</th>
                    <th className="py-2 pr-4">Прогресс</th>
                    <th className="py-2 pr-4">Баллы</th>
                    <th className="py-2 pr-4">Статус</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {data.courseProgress.modules.map((row) => (
                    <tr key={row.module.id} className="border-b border-border/70">
                      <td className="py-2 pr-4 font-medium">{row.module.title}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{row.unlocked ? "Да" : "Нет"}</td>
                      <td className="py-2 pr-4 tabular-nums">{row.progressPercent}%</td>
                      <td className="py-2 pr-4 tabular-nums">{row.score}</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {row.moduleCompleted
                          ? "Завершён"
                          : row.practicePendingReview
                            ? "Практика на проверке"
                            : row.practiceNeedsRevision
                              ? "Нужна доработка"
                              : row.testNeedsRetry
                                ? "Повтор теста"
                                : "В процессе"}
                      </td>
                      <td className="py-2">
                        <Link
                          href={`/admin/modules/${row.module.id}/edit`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Модуль
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />
        )}
      </AdminTableCard>
      </div>

      <div id={ADMIN_STUDENT_SECTION.tests} className="scroll-mt-24">
      <AdminTableCard
        title="Тесты"
        description="Сводка попыток: балл и зачёт. Варианты ответов и ключи не показываются."
      >
        {data.testAttempts.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground sm:px-0">Попыток нет.</p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border border-t border-border">
                {data.testAttempts.map((t) => (
                  <AdminMobileCard key={t.id} className="space-y-2">
                    <p className="font-medium text-foreground">{t.testTitle}</p>
                    <p className="text-sm text-muted-foreground">{t.moduleTitle}</p>
                    <p className="text-sm tabular-nums">
                      {t.score} / {t.maxScore} {passedBadge(t.passed)}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">{formatAt(t.createdAt)}</p>
                  </AdminMobileCard>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="py-2 pr-4">Тест</th>
                    <th className="py-2 pr-4">Модуль</th>
                    <th className="py-2 pr-4">Баллы</th>
                    <th className="py-2 pr-4">Результат</th>
                    <th className="py-2">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {data.testAttempts.map((t) => (
                    <tr key={t.id} className="border-b border-border/70">
                      <td className="py-2 pr-4">{t.testTitle}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{t.moduleTitle}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        {t.score} / {t.maxScore}
                      </td>
                      <td className="py-2 pr-4">{passedBadge(t.passed)}</td>
                      <td className="py-2 tabular-nums text-muted-foreground">{formatAt(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />
        )}
      </AdminTableCard>
      </div>

      <div id={ADMIN_STUDENT_SECTION.practices} className="scroll-mt-24">
      <AdminTableCard
        title="Практики"
        description="Статус отправок без текста ответа и файлов."
      >
        {data.submissions.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground sm:px-0">Отправок нет.</p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border border-t border-border">
                {data.submissions.map((s) => (
                  <AdminMobileCard key={s.id} className="space-y-3">
                    <p className="font-medium text-foreground">{s.taskTitle}</p>
                    <p className="text-sm text-muted-foreground">{s.moduleTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {submissionStatusLabelRu(s.status)} · {s.score ?? "—"} б.
                      {s.hasFile ? " · файл" : ""}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">{formatAt(s.updatedAt)}</p>
                    <Button asChild size="sm" variant="secondary" className="min-h-10 w-full">
                      <Link href={s.reviewHref}>Открыть проверку</Link>
                    </Button>
                  </AdminMobileCard>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="py-2 pr-4">Задание</th>
                    <th className="py-2 pr-4">Модуль</th>
                    <th className="py-2 pr-4">Статус</th>
                    <th className="py-2 pr-4">Баллы</th>
                    <th className="py-2 pr-4">Вложение</th>
                    <th className="py-2 pr-4">Обновлено</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {data.submissions.map((s) => (
                    <tr key={s.id} className="border-b border-border/70">
                      <td className="py-2 pr-4">{s.taskTitle}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{s.moduleTitle}</td>
                      <td className="py-2 pr-4">{submissionStatusLabelRu(s.status)}</td>
                      <td className="py-2 pr-4 tabular-nums">{s.score ?? "—"}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{s.hasFile ? "Файл" : "—"}</td>
                      <td className="py-2 pr-4 tabular-nums text-muted-foreground">{formatAt(s.updatedAt)}</td>
                      <td className="py-2">
                        <Link href={s.reviewHref} className="text-sm font-medium text-primary hover:underline">
                          Проверка
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />
        )}
      </AdminTableCard>
      </div>

      <SectionCard
        id={ADMIN_STUDENT_SECTION.certificates}
        title="Сертификат"
        description="Реестр и публичная проверка. Выдача — через server action с проверкой условий курса."
        className="scroll-mt-24 space-y-4 text-sm"
      >
        {data.certificates.length === 0 ? (
          <>
            <p className="text-muted-foreground">Сертификат не выдавался.</p>
            {data.eligibleForCertificate && data.course ? (
              <div className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-3">
                <p className="text-sm text-foreground">
                  Условия курса выполнены — можно выдать сертификат с проверкой на сервере или дождаться самостоятельной
                  генерации студентом.
                </p>
                <div className="mt-3">
                  <AdminIssueCertificateForm
                    userId={data.user.id}
                    courseId={data.course.id}
                    studentLabel={displayName}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Выдача откроется после завершения всех активных модулей программы.
              </p>
            )}
          </>
        ) : (
          data.certificates.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="font-medium text-foreground">{c.courseTitle}</p>
              <p className="mt-1 text-muted-foreground">Номер: {c.certificateNumber}</p>
              <p className="text-muted-foreground">Выдан: {formatAt(c.issuedAt)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="min-h-10">
                  <Link href={c.verifyHref} target="_blank" rel="noreferrer">
                    Проверка подлинности
                    <ExternalLink className="ml-1 size-3.5" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="min-h-10">
                  <a href={`/api/certificates/download/${c.id}`}>Скачать PDF</a>
                </Button>
                <Badge variant="success">active</Badge>
              </div>
            </div>
          ))
        )}
      </SectionCard>
    </div>
  );
}
