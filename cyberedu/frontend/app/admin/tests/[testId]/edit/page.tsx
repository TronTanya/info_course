import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminTestEditStickyNav } from "@/components/admin/admin-test-edit-sticky-nav";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminTestMetaForm } from "@/components/admin/admin-test-meta-form";
import { AdminTestQuestionCard } from "@/components/admin/admin-test-question-card";
import { Alert } from "@/components/ui/alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { createQuestionAction } from "@/lib/actions/admin-tests";

const ERR_MSG: Record<string, string> = {
  min_answers: "Нельзя удалить вариант: должно остаться не менее двух.",
  answer_rules:
    "Правила вариантов не выполнены: для одного ответа и «верно/неверно» — ровно один правильный; для нескольких — хотя бы один правильный.",
  empty_answer: "Текст варианта не может быть пустым.",
};

type Props = {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ err?: string }>;
};

function truncateTitle(title: string, max = 40): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { testId } = await params;
  const t = await prisma.test.findUnique({
    where: { id: testId },
    select: { title: true },
  });
  return { title: t ? `Тест: ${t.title}` : "Тест" };
}

export default async function AdminEditTestPage({ params, searchParams }: Props) {
  const { testId } = await params;
  const { err } = await searchParams;

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      module: { select: { id: true, title: true, orderNumber: true } },
      questions: {
        orderBy: { orderNumber: "asc" },
        include: { answers: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!test) notFound();

  const n = test.questions.length;
  const errText = err && ERR_MSG[err] ? ERR_MSG[err] : err ? "Не удалось выполнить операцию." : null;

  return (
    <AdminShell>
      <div className="space-y-6 pb-24">
      <AdminPageHeader
        title="Редактирование теста"
        description={`Модуль: ${test.module.title}. Порог прохождения считается только по вопросам с автоматической оценкой.`}
        breadcrumb={
          <AdminBreadcrumbs
            items={adminBreadcrumbItems(truncateTitle(test.title), {
              href: "/admin/tests",
              label: "Тесты",
            })}
          />
        }
      />

      <div className="space-y-8">
        {errText ? (
          <Alert variant="danger" title="Внимание">
            {errText}
          </Alert>
        ) : null}

        <AdminTestMetaForm testId={test.id} title={test.title} minScore={test.minScore} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Вопросы</h2>
          <form action={createQuestionAction.bind(null, test.id)}>
            <Button type="submit" variant="secondary">
              Добавить вопрос
            </Button>
          </form>
        </div>

        {n === 0 ? (
          <EmptyState
            title="Вопросов пока нет"
            description="Добавьте первый вопрос, затем настройте тип, баллы и варианты ответов. Без вопросов студент не сможет пройти тест."
            action={
              <form action={createQuestionAction.bind(null, test.id)}>
                <Button type="submit" variant="primary">
                  Добавить первый вопрос
                </Button>
              </form>
            }
          />
        ) : (
          <div className="space-y-6">
            {test.questions.map((q, idx) => (
              <AdminTestQuestionCard
                key={q.id}
                testId={test.id}
                question={{
                  id: q.id,
                  questionText: q.questionText,
                  questionType: q.questionType,
                  points: q.points,
                  orderNumber: q.orderNumber,
                  textExpectedAnswer: q.textExpectedAnswer,
                  textManualGrading: q.textManualGrading,
                  answers: q.answers.map((a) => ({
                    id: a.id,
                    answerText: a.answerText,
                    isCorrect: a.isCorrect,
                  })),
                }}
                positionLabel={idx + 1}
                canUp={idx > 0}
                canDown={idx < n - 1}
                questionCount={n}
              />
            ))}
          </div>
        )}
      </div>

      <AdminTestEditStickyNav moduleId={test.module.id} />
      </div>
    </AdminShell>
  );
}
