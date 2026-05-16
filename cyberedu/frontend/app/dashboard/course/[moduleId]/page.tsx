import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ModuleHubStepList } from "@/components/course/module-hub-step-list";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { buildModuleHubSteps } from "@/lib/module-hub-steps";
import { prisma } from "@/lib/db";
import {
  getModuleProgress,
  isModuleUnlocked,
  recalculateModuleProgress,
} from "@/lib/progress";
import { requireAuth } from "@/lib/permissions";

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
  if (hasStarted || progressPercent > 0) return { text: "В процессе", variant: "warning" };
  return { text: "Доступен", variant: "secondary" };
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
  const desc = courseModule.description?.trim() || "Описание модуля появится позже.";

  return (
    <DashboardShell>
      <>
        <PageHeader
          breadcrumb={
            <Button variant="ghost" className="-ml-2 h-auto w-fit px-2 text-muted-foreground" asChild>
              <Link href="/dashboard/course">← К курсу</Link>
            </Button>
          }
          eyebrow={`Модуль ${courseModule.orderNumber}`}
          title={courseModule.title}
          description={desc}
          actions={
            <Badge className="w-fit shrink-0" variant={overview.variant}>
              {overview.text}
            </Badge>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Прогресс по шагам" value={`${progressPercent}%`} />
          <MetricCard label="Баллы за модуль" value={score} />
          <div className="flex min-h-full flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-card sm:col-span-2">
            <ProgressBar value={progressPercent} max={100} label="Выполнение шагов модуля" />
          </div>
        </section>

        <section>
          <h2 className="typo-h2 mb-4">Шаги прохождения</h2>
          <ModuleHubStepList steps={steps} />
        </section>

        <SectionCard id="module-result" variant="muted" className="scroll-mt-24" title="Результат">
          {moduleCompleted ? (
            <p className="typo-body-muted">
              Модуль завершён. Набрано баллов: <span className="font-semibold text-foreground">{score}</span>. Следующий модуль
              открыт в общем списке курса.
            </p>
          ) : p?.practiceCompleted ? (
            <p className="typo-body-muted">
              Практика принята; итоговый статус модуля обновится после проверки всех требований. Текущие баллы:{" "}
              <span className="font-semibold text-foreground">{score}</span>.
            </p>
          ) : (
            <p className="typo-body-muted">Здесь появится итог после успешной практики. Сначала пройдите лекцию, тест и задание.</p>
          )}
        </SectionCard>
      </>
    </DashboardShell>
  );
}
