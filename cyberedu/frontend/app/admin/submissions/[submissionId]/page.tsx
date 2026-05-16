import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminSubmissionReviewForm } from "@/components/admin/admin-submission-review-form";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ submissionId: string }> };

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
          id: true,
          title: true,
          description: true,
          taskType: true,
          maxScore: true,
          module: { select: { id: true, title: true, courseId: true } },
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
      <PageHeader
        title="Проверка отправки"
        description={`Модуль: ${sub.practicalTask.module.title} · ${sub.practicalTask.title}`}
        breadcrumb={
          <Link href="/admin/submissions" className="hover:text-foreground">
            ← Все отправки
          </Link>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Студент</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">ФИО</dt>
                <dd className="font-medium text-foreground">{fio}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>
                  <a className="text-primary hover:underline" href={`mailto:${sub.user.email}`}>
                    {sub.user.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Учебное заведение</dt>
                <dd className="text-foreground">{p?.educationalInstitution ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Задание</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Модуль: <span className="text-foreground">{sub.practicalTask.module.title}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Тип: {taskTypeRu(sub.practicalTask.taskType)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Макс. балл: {sub.practicalTask.maxScore}</p>
            <div className="mt-3 max-w-none text-sm text-foreground">
              {sub.practicalTask.description.split("\n").map((line, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Ответ студента</h2>
            {sub.textAnswer?.trim() ? (
              <div className="mt-3 rounded-xl bg-muted/30 p-3 text-sm whitespace-pre-wrap text-foreground">
                {sub.textAnswer}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Текстового ответа нет.</p>
            )}
            {fileHref ? (
              <p className="mt-4">
                <a className="text-primary text-sm font-medium hover:underline" href={fileHref}>
                  Скачать прикреплённый файл
                </a>
              </p>
            ) : null}
            <p className="mt-4 text-xs text-muted-foreground">
              Дата отправки: <span className="tabular-nums text-foreground">{sub.createdAt.toLocaleString("ru-RU")}</span>
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
          </section>

          {courseHint.allModulesDone ? (
            <Alert variant="success" title="Курс завершён студентом">
              {courseHint.hasCertificate
                ? "Сертификат уже есть в системе (запись Certificate)."
                : "Все активные модули курса отмечены завершёнными. Можно выпустить сертификат через раздел админки «Сертификаты» (или существующий сценарий генерации), когда он будет подключён."}
            </Alert>
          ) : null}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Решение проверяющего</h2>
          <AdminSubmissionReviewForm
            submissionId={sub.id}
            maxScore={sub.practicalTask.maxScore}
            currentStatus={sub.status}
            currentScore={sub.score}
            currentComment={sub.adminComment}
          />
        </div>
      </div>
    </AdminShell>
  );
}
