import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ModuleAfterPreview } from "@/components/course/module-after-preview";
import { ModuleHubStepList } from "@/components/course/module-hub-step-list";
import { ModuleLearningShell } from "@/components/course/module-learning-shell";
import { ModuleOverviewPanel } from "@/components/course/module-overview-panel";
import { LearnSection } from "@/components/learn/learn-chrome";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildLearningPageContext } from "@/lib/learning-context";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionCard } from "@/components/ui/section-card";
import { buildModuleHubSteps } from "@/lib/module-hub-steps";
import { moduleStepBreadcrumbs } from "@/lib/student-nav";
import { prisma } from "@/lib/db";
import {
  getModuleProgress,
  getModuleRequirements,
  isModuleUnlocked,
  recalculateModuleProgress,
  syncAndGetUserCourseProgress,
} from "@/lib/progress";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { requireAuth } from "@/lib/permissions";
import type { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true, isActive: true },
  });
  if (!m?.isActive) return { title: "Модуль" };
  return { title: m.title };
}

function moduleOverviewLabel(
  moduleCompleted: boolean,
  progressPercent: number,
  hasStarted: boolean,
): { text: string; variant: NonNullable<ComponentProps<typeof Badge>["variant"]> } {
  if (moduleCompleted) return { text: "Завершён", variant: "success" };
  if (hasStarted || progressPercent > 0) return { text: "В процессе", variant: "primary" };
  return { text: "Не начат", variant: "outline" };
}

export default async function ModulePage({ params }: Props) {
  const session = await requireAuth();
  const { moduleId } = await params;

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      title: true,
      description: true,
      orderNumber: true,
      courseId: true,
      isActive: true,
      lessons: { select: { videoUrl: true } },
      tests: { select: { id: true } },
      practicalTasks: { select: { id: true } },
    },
  });

  if (!courseModule || !courseModule.isActive) {
    notFound();
  }

  const unlocked = await isModuleUnlocked(session.user.id, moduleId);

  if (!unlocked) {
    redirect("/dashboard/course?locked=1");
  }

  await recalculateModuleProgress(session.user.id, moduleId);
  const mp = await getModuleProgress(session.user.id, moduleId);
  if (!mp) notFound();

  const { requirements: req, progress, progressPercent, moduleCompleted } = mp;
  const p = progress;
  const hasStarted = Boolean(
    p?.lessonCompleted || p?.videoCompleted || p?.testCompleted || p?.practiceCompleted,
  );
  const overview = moduleOverviewLabel(moduleCompleted, progressPercent, hasStarted);
  const steps = buildModuleHubSteps(moduleId, true, req, p);
  const score = p?.score ?? 0;
  const desc = courseModule.description?.trim() || "Модуль киберлаборатории: лекция, тест и практический сценарий.";
  const moduleSteps = moduleStepsLabel(mp.requirements, mp.progress);
  const learning = await buildLearningPageContext(
    session.user.id,
    moduleId,
    `/dashboard/course/${moduleId}`,
    req,
    p,
  );

  const courseProgress = await syncAndGetUserCourseProgress(session.user.id, courseModule.courseId);
  const trackModules = courseProgress?.modules ?? [];
  const progressRow: CourseProgressModuleRow | null =
    trackModules.find((m) => m.module.id === moduleId) ??
    ({
      module: {
        id: courseModule.id,
        title: courseModule.title,
        description: courseModule.description,
        orderNumber: courseModule.orderNumber,
      },
      requirements: req,
      contentCounts: {
        lessons: courseModule.lessons.length,
        tests: courseModule.tests.length,
        practices: courseModule.practicalTasks.length,
      },
      progress: p,
      unlocked: true,
      progressPercent,
      score,
      moduleCompleted,
    } satisfies CourseProgressModuleRow);

  const reqFull = getModuleRequirements(courseModule);
  const nextStep = steps.find((s) => s.actionHref && (s.status === "available" || s.status === "not_started"));
  const continueHref = nextStep?.actionHref ?? `/dashboard/course/${moduleId}/lesson`;
  const continueLabel =
    nextStep?.actionLabel ?? (hasStarted ? "Продолжить" : "Начать");

  return (
    <DashboardShell wide>
      <ModuleLearningShell
        learning={learning}
        moduleTitle={courseModule.title}
        moduleProgressPercent={progressPercent}
        moduleStepsLabel={moduleSteps}
        breadcrumbItems={moduleStepBreadcrumbs(moduleId, courseModule.orderNumber, "Обзор модуля")}
        eyebrow={`Модуль ${courseModule.orderNumber}`}
        title={courseModule.title}
        description={desc}
      >
        <ModuleOverviewPanel
          orderNumber={courseModule.orderNumber}
          title={courseModule.title}
          description={desc}
          progressPercent={progressPercent}
          score={score}
          statusLabel={overview.text}
          statusVariant={overview.variant}
          contentCounts={{
            lessons: courseModule.lessons.length,
            tests: courseModule.tests.length,
            practices: courseModule.practicalTasks.length,
          }}
          requirements={reqFull}
          continueHref={continueHref}
          continueLabel={continueLabel}
          progressRow={progressRow}
        />

        <ModuleAfterPreview
          modules={trackModules}
          currentModuleId={moduleId}
          currentModuleCompleted={moduleCompleted}
        />

        <LearnSection>
          <SectionHeader
            eyebrow="Лаборатория"
            title="Шаги модуля"
            description="Пройдите этапы по порядку — следующий откроется после предыдущего."
          />
          <ModuleHubStepList steps={steps} />
        </LearnSection>

        <LearnSection>
          <SectionCard id="module-result" variant="lab" className="scroll-mt-24" title="Результат модуля">
            {moduleCompleted ? (
              <p className="typo-body-muted">
                Модуль завершён. Набрано баллов: <span className="font-semibold text-foreground">{score}</span>. Следующий
                модуль открыт на{" "}
                <Link href="/dashboard/course" className="font-medium text-primary hover:underline">
                  карте трека
                </Link>
                .
              </p>
            ) : p?.practiceCompleted ? (
              <p className="typo-body-muted">
                Практика принята; итоговый статус обновится после проверки всех требований. Текущие баллы:{" "}
                <span className="font-semibold text-foreground">{score}</span>.
              </p>
            ) : (
              <p className="typo-body-muted">
                Итог появится после успешного прохождения практики. Сначала лекция, затем тест и задание.
              </p>
            )}
          </SectionCard>
        </LearnSection>
      </ModuleLearningShell>
    </DashboardShell>
  );
}

function moduleStepsLabel(
  req: { lessonRequired: boolean; videoRequired: boolean; testRequired: boolean; practiceRequired: boolean; totalSteps: number },
  p: { lessonCompleted: boolean; videoCompleted: boolean; testCompleted: boolean; practiceCompleted: boolean } | null | undefined,
): string {
  const row = p;
  let d = 0;
  if (req.lessonRequired && row?.lessonCompleted) d++;
  if (req.videoRequired && row?.videoCompleted) d++;
  if (req.testRequired && row?.testCompleted) d++;
  if (req.practiceRequired && row?.practiceCompleted) d++;
  const t = req.totalSteps;
  return t ? `${d} из ${t}` : "—";
}
