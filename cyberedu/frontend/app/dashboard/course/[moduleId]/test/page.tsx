import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { assertModuleAccess, checkTestPrerequisites } from "@/lib/course-progress-guards";
import { requireAuth } from "@/lib/permissions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageShell } from "@/components/learn/learn-chrome";
import { ModuleTestRunner } from "@/components/test/module-test-runner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ moduleId: string }> };

/** Перемешивание вариантов на сервере (без isCorrect — порядок из БД не подсказывает «правильный» индекс). */
function shuffleAnswerStubs<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true, isActive: true },
  });
  if (!m?.isActive) return { title: "Тест" };
  return { title: `Тест · ${m.title}` };
}

export default async function TestPage({ params }: Props) {
  const session = await requireAuth();
  const { moduleId } = await params;
  await assertModuleAccess(session.user.id, moduleId);

  const gate = await checkTestPrerequisites(session.user.id, moduleId);
  if (!gate.ok) {
    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { title: true },
    });
    const lessonHref = `/dashboard/course/${moduleId}/lesson`;
    const courseHref = "/dashboard/course";
    const isCourseLevel = gate.code === "MODULE_INACTIVE" || gate.code === "MODULE_LOCKED";
    return (
      <DashboardShell>
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Тест · {mod?.title ?? "модуль"}</h1>
          <Card>
            <CardHeader>
              <CardTitle>Шаг недоступен</CardTitle>
              <CardDescription>{gate.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="primary">
                <Link href={isCourseLevel ? courseHref : lessonHref}>
                  {isCourseLevel ? "К списку модулей" : "Перейти к лекции"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const userId = session.user.id;

  const [mod, tests] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      select: { title: true },
    }),
    prisma.test.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        minScore: true,
        questions: {
          orderBy: { orderNumber: "asc" },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            points: true,
            orderNumber: true,
            textManualGrading: true,
            answers: {
              orderBy: { id: "asc" },
              select: { id: true, answerText: true },
            },
          },
        },
      },
    }),
  ]);

  if (tests.length === 0) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Тест · {mod?.title ?? "модуль"}</h1>
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">Для этого модуля пока не добавлен контрольный тест.</CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const testsPayload = await Promise.all(
    tests.map(async (t) => {
      const lastAttempt = await prisma.testAttempt.findFirst({
        where: { userId, testId: t.id },
        orderBy: { createdAt: "desc" },
        select: { score: true, maxScore: true, passed: true, createdAt: true },
      });
      const percent =
        lastAttempt && lastAttempt.maxScore > 0 ? Math.round((lastAttempt.score / lastAttempt.maxScore) * 100) : 0;

      return {
        testId: t.id,
        title: t.title,
        minScore: t.minScore,
        questions: t.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          orderNumber: q.orderNumber,
          manualTextGrading: q.questionType === "TEXT" && q.textManualGrading,
          answers:
            q.questionType === "TEXT"
              ? []
              : shuffleAnswerStubs(q.answers.map((a) => ({ id: a.id, answerText: a.answerText }))),
        })),
        lastAttempt: lastAttempt
          ? {
              score: lastAttempt.score,
              maxScore: lastAttempt.maxScore,
              passed: lastAttempt.passed,
              percent,
              createdAt: lastAttempt.createdAt.toISOString(),
            }
          : null,
      };
    }),
  );

  return (
    <DashboardShell>
      <LearnPageShell>
        <header className="ce-learn-header ce-border-beam rounded-2xl border border-border/70 bg-card/90 p-5 shadow-card">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan/90">Assessment</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Тест · {mod?.title ?? "модуль"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверка на сервере. Порядок вариантов при каждой загрузке случайный.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 w-fit">
            <Link href={`/dashboard/course/${moduleId}`}>← К модулю</Link>
          </Button>
        </header>

        {tests.length > 1 ? (
          <p className="text-sm text-muted-foreground">В модуле несколько тестов — пройдите каждый по очереди.</p>
        ) : null}

        <div className="space-y-8">
          {testsPayload.map((row) => (
            <ModuleTestRunner
              key={row.testId}
              moduleId={moduleId}
              testId={row.testId}
              title={row.title}
              minScore={row.minScore}
              questions={row.questions}
              lastAttempt={row.lastAttempt}
            />
          ))}
        </div>
      </LearnPageShell>
    </DashboardShell>
  );
}
