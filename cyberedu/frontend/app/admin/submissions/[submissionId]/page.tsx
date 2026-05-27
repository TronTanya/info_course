import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSubmissionReviewForm } from "@/components/admin/admin-submission-review-form";
import { AdminShell } from "@/components/layout/admin-shell";
import { Alert } from "@/components/ui/alert";
import { SectionCard } from "@/components/ui/section-card";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ submissionId: string }> };

function truncateTitle(title: string, max = 48): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function statusRu(s: string): string {
  const m: Record<string, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "На доработке",
  };
  return m[s] ?? s;
}

function taskTypeRu(t: string): string {
  const m: Record<string, string> = {
    TEXT_ANSWER: "Текстовый ответ",
    FILE_UPLOAD: "Загрузка файла",
    INTERACTIVE: "Интерактив (консоль)",
    COMBINED: "Комбинированное",
    SITUATION_CHOICE: "Ситуации и выбор",
    PASSWORD_ANALYSIS: "Анализ паролей",
    PHISHING_ANALYSIS: "Разбор фишинга",
    CHECKLIST: "Чек-лист",
    URL_ANALYSIS: "Анализ ссылок",
    TRAINING_CONSOLE: "Учебная консоль",
    CRYPTO_TASK: "Криптография (учебно)",
    LOG_ANALYSIS: "Анализ журнала",
  };
  return m[t] ?? t;
}

async function courseCompletionForUser(userId: string, courseId: string) {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    select: { id: true },
  });
  if (!modules.length) return { allModulesDone: false, hasCertificate: false };
  const progress = await prisma.progress.findMany({
    where: { userId, moduleId: { in: modules.map((m) => m.id) } },
    select: { moduleId: true, moduleCompleted: true },
  });
  const map = new Map(progress.map((p) => [p.moduleId, p.moduleCompleted]));
  const allModulesDone = modules.every((mod) => Boolean(map.get(mod.id)));
  const cert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  return { allModulesDone, hasCertificate: Boolean(cert) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { submissionId } = await params;
  const s = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { practicalTask: { select: { title: true } } },
  });
  return { title: s ? `Проверка: ${s.practicalTask.title}` : "Отправка" };
}

export default async function AdminSubmissionDetailPage({ params }: Props) {
  const { submissionId } = await params;

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              educationalInstitution: true,
            },
          },
        },
      },
      practicalTask: {
        select: {
          title: true,
          description: true,
          taskType: true,
          maxScore: true,
          module: { select: { title: true, courseId: true } },
        },
      },
    },
  });

  if (!sub) notFound();
  if (sub.status === "DRAFT") notFound();

  const p = sub.user.profile;
  const fio = p
    ? `${p.lastName} ${p.firstName}${p.middleName ? ` ${p.middleName}` : ""}`.trim()
    : "Профиль не заполнен";

  const courseHint = await courseCompletionForUser(sub.userId, sub.practicalTask.module.courseId);

  const fileHref = sub.fileUrl?.startsWith("/api/") ? sub.fileUrl : null;

  return (
    <AdminShell>
      <div className="space-y-8">
        <AdminPageHeader
          eyebrow="Проверка отправки"
          title={sub.practicalTask.title}
          description={`Модуль: ${sub.practicalTask.module.title}`}
          breadcrumb={
            <AdminBreadcrumbs
              items={adminBreadcrumbItems(truncateTitle(sub.practicalTask.title), {
                href: "/admin/submissions",
                label: "Проверка практик",
              })}
            />
          }
        />

        <div className="grid gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="space-y-6">
            <SectionCard variant="lab" title="Студент" flushTitle>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="typo-label text-muted-foreground">ФИО</dt>
                  <dd className="font-medium text-foreground">{fio}</dd>
                </div>
                <div>
                  <dt className="typo-label text-muted-foreground">Email</dt>
                  <dd>
                    <a className="text-primary hover:underline" href={`mailto:${sub.user.email}`}>
                      {sub.user.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="typo-label text-muted-foreground">Учебное заведение</dt>
                  <dd className="text-foreground">{p?.educationalInstitution ?? "—"}</dd>
                </div>
              </dl>
            </SectionCard>

            <SectionCard variant="lab" title="Задание" flushTitle>
              <p className="text-sm text-muted-foreground">
                Модуль: <span className="text-foreground">{sub.practicalTask.module.title}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Тип: {taskTypeRu(sub.practicalTask.taskType)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Макс. балл: {sub.practicalTask.maxScore}</p>
              <div className="mt-3 max-w-none text-sm text-foreground">
                {sub.practicalTask.description.split("\n").map((line, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            </SectionCard>

            <SectionCard variant="lab" title="Ответ студента" flushTitle>
              {sub.textAnswer?.trim() ? (
                <div className="mt-1 rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap text-foreground">
                  {sub.textAnswer}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Текстового ответа нет.</p>
              )}
              {fileHref ? (
                <p className="mt-4">
                  <a className="text-sm font-medium text-primary hover:underline" href={fileHref}>
                    Скачать прикреплённый файл
                  </a>
                </p>
              ) : null}
              <p className="mt-4 text-xs text-muted-foreground">
                Дата отправки:{" "}
                <span className="tabular-nums text-foreground">{sub.createdAt.toLocaleString("ru-RU")}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Текущий статус: <span className="font-medium text-foreground">{statusRu(sub.status)}</span>
                {sub.checkedAt ? (
                  <>
                    {" "}
                    · проверено:{" "}
                    <span className="tabular-nums text-foreground">{sub.checkedAt.toLocaleString("ru-RU")}</span>
                  </>
                ) : null}
              </p>
            </SectionCard>

            {courseHint.allModulesDone ? (
              <Alert variant="success" title="Курс завершён студентом">
                {courseHint.hasCertificate
                  ? "Сертификат уже есть в системе (запись Certificate)."
                  : "Все активные модули курса отмечены завершёнными. Можно выпустить сертификат через раздел «Сертификаты»."}
              </Alert>
            ) : null}
          </div>

          <div>
            <p className="typo-label mb-3 text-primary">Решение проверяющего</p>
            <AdminSubmissionReviewForm
              submissionId={sub.id}
              maxScore={sub.practicalTask.maxScore}
              currentStatus={sub.status}
              currentScore={sub.score}
              currentComment={sub.adminComment}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
