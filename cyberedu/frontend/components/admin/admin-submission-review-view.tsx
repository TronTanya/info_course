import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSubmissionReviewForm } from "@/components/admin/admin-submission-review-form";
import { SafeRubricPreview } from "@/components/practice/safe-rubric-preview";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import type { AdminSubmissionReviewData } from "@/lib/admin-submission-review";
import { TASK_INSTRUCTIONS_SECTION_LABELS } from "@/lib/practice-task-instructions-ui";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InstructionSections({
  sections,
}: {
  sections: NonNullable<AdminSubmissionReviewData["instructionSections"]>;
}) {
  const blocks = [
    { key: "whatToDo" as const, lines: sections.whatToDo },
    { key: "answerFormat" as const, lines: sections.answerFormat },
    { key: "minimumRequirements" as const, lines: sections.minimumRequirements },
    { key: "constraints" as const, lines: sections.constraints },
  ].filter((b) => b.lines.length > 0);

  return (
    <div className="mt-3 space-y-4">
      {blocks.map((block) => (
        <div key={block.key}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {TASK_INSTRUCTIONS_SECTION_LABELS[block.key]}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
            {block.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function AdminSubmissionReviewView({ data }: { data: AdminSubmissionReviewData }) {
  const { meta, student, task, scenario, instructionSections, instructionLines, safeRubric, answer } =
    data;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Проверка практики"
        title={task.title}
        description={`${task.moduleTitle} · ${task.taskTypeLabel}`}
        meta={
          <>
            <Badge variant="secondary">{meta.statusLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              Отправлено {formatAt(meta.submittedAt)}
            </span>
          </>
        }
        breadcrumb={
          <Link href="/admin/submissions" className="hover:text-foreground">
            ← Очередь отправок
          </Link>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-6">
          <SectionCard variant="lab" title="Студент" flushTitle>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="typo-label text-muted-foreground">ФИО / имя</dt>
                <dd className="font-medium text-foreground">{student.label}</dd>
              </div>
              <div>
                <dt className="typo-label text-muted-foreground">Email</dt>
                <dd>
                  <a className="text-primary hover:underline" href={`mailto:${student.email}`}>
                    {student.email}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="typo-label text-muted-foreground">Учебное заведение</dt>
                <dd className="text-foreground">{student.educationalInstitution ?? "—"}</dd>
              </div>
              <div>
                <dt className="typo-label text-muted-foreground">Отправлено</dt>
                <dd className="tabular-nums text-foreground">{formatAt(meta.submittedAt)}</dd>
              </div>
              <div>
                <dt className="typo-label text-muted-foreground">Обновлено</dt>
                <dd className="tabular-nums text-foreground">{formatAt(meta.updatedAt)}</dd>
              </div>
            </dl>
            <ButtonRowLink userId={student.userId} />
          </SectionCard>

          <SectionCard variant="lab" title="Сценарий и инструкции" flushTitle>
            <p className="text-sm text-muted-foreground">
              Модуль: <span className="font-medium text-foreground">{task.moduleTitle}</span>
              {" · "}
              Макс. балл: <span className="tabular-nums">{task.maxScore}</span>
            </p>
            {scenario ? (
              <dl className="mt-4 space-y-3 text-sm">
                {scenario.role ? (
                  <div>
                    <dt className="typo-label text-muted-foreground">Роль</dt>
                    <dd className="text-foreground">{scenario.role}</dd>
                  </div>
                ) : null}
                {scenario.context ? (
                  <div>
                    <dt className="typo-label text-muted-foreground">Контекст</dt>
                    <dd className="whitespace-pre-wrap text-foreground">{scenario.context}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="typo-label text-muted-foreground">Цель задания</dt>
                  <dd className="whitespace-pre-wrap text-foreground">{scenario.goal}</dd>
                </div>
                {scenario.consoleScenario ? (
                  <div>
                    <dt className="typo-label text-muted-foreground">Консоль / симулятор</dt>
                    <dd className="whitespace-pre-wrap font-mono text-xs text-foreground">
                      {scenario.consoleScenario}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
                {instructionLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
            {instructionSections ? <InstructionSections sections={instructionSections} /> : null}
          </SectionCard>

          <SafeRubricPreview
            items={safeRubric}
            hideWhenEmpty={false}
            className="shadow-none"
          />

          <SectionCard variant="lab" title="Ответ студента" flushTitle>
            {answer.textAnswer?.trim() ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 font-mono text-sm whitespace-pre-wrap text-foreground">
                {answer.textAnswer}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Текстового ответа нет.</p>
            )}
            {answer.fileHref ? (
              <p className="mt-4">
                <a
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                  href={answer.fileHref}
                >
                  Скачать прикреплённый файл
                </a>
              </p>
            ) : null}
          </SectionCard>

          {data.courseCompletionHint.allModulesDone ? (
            <Alert variant="success" title="Курс завершён студентом">
              {data.courseCompletionHint.hasCertificate
                ? "Сертификат уже есть в реестре."
                : "Все активные модули завершены — при необходимости выдайте сертификат в разделе «Сертификаты»."}
            </Alert>
          ) : null}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <AdminSubmissionReviewForm
            submissionId={meta.submissionId}
            maxScore={task.maxScore}
            currentStatus={meta.status}
            currentScore={meta.score}
            currentComment={meta.adminComment}
          />
        </aside>
      </div>
    </div>
  );
}

function ButtonRowLink({ userId }: { userId: string }) {
  return (
    <p className="mt-4">
      <Link
        href={`/admin/users/${userId}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        Карточка студента
      </Link>
    </p>
  );
}
