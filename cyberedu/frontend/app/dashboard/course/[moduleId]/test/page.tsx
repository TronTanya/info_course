import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { loadTestPageData } from "@/lib/test-page-load";
import { getTestAttemptLimitFromEnv } from "@/lib/test-retry";
import { buildTestPageMetadata } from "@/lib/test-page-metadata";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentPageHeader } from "@/components/layout/student-page-header";
import { LearnPageShell } from "@/components/learn/learn-chrome";
import { ModuleTestRunner } from "@/components/test/module-test-runner";
import {
  TestLockedState,
  TestPageEmptyState,
  TestPageLoadError,
  TestUnauthorizedState,
} from "@/components/test/test-page-states";
import { moduleStepBreadcrumbs } from "@/lib/student-nav";

const testMaxAttempts = getTestAttemptLimitFromEnv();
type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const session = await auth();
  return buildTestPageMetadata(moduleId, session?.user?.id);
}

export default async function TestPage({ params }: Props) {
  const session = await auth();
  const { moduleId } = await params;
  const result = await loadTestPageData(session?.user?.id, moduleId);

  if (result.status === "unauthorized") {
    return (
      <DashboardShell>
        <LearnPageShell>
          <TestUnauthorizedState />
        </LearnPageShell>
      </DashboardShell>
    );
  }

  if (result.status === "locked") {
    return (
      <DashboardShell>
        <LearnPageShell>
          <TestLockedState
            reason={result.reason}
            lessonHref={result.lessonHref}
            moduleTitle={result.moduleTitle}
          />
        </LearnPageShell>
      </DashboardShell>
    );
  }

  if (result.status === "empty") {
    return (
      <DashboardShell>
        <LearnPageShell>
          <TestPageEmptyState
            kind={result.kind}
            moduleTitle={result.moduleTitle}
            moduleId={result.moduleId}
          />
        </LearnPageShell>
      </DashboardShell>
    );
  }

  if (result.status === "error") {
    return (
      <DashboardShell>
        <LearnPageShell>
          <TestPageLoadError kind={result.kind} />
        </LearnPageShell>
      </DashboardShell>
    );
  }

  const { data } = result;

  return (
    <DashboardShell>
      <LearnPageShell>
        <StudentPageHeader
          breadcrumbItems={
            data.moduleOrderNumber != null
              ? moduleStepBreadcrumbs(data.moduleId, data.moduleOrderNumber, "Тест")
              : undefined
          }
          eyebrow="Cyber Lab · Тесты"
          title={`Тесты · ${data.moduleTitle}`}
          description="Контроль знаний перед практикой. Варианты ответов перемешиваются при каждом запуске."
          backHref={`/dashboard/course/${data.moduleId}`}
          backLabel="← К модулю"
        />

        {data.tests.length > 1 ? (
          <p className="text-sm text-muted-foreground">
            В модуле {data.tests.length} теста — пройдите каждый с карточки ниже.
          </p>
        ) : null}

        <div className="space-y-8">
          {data.tests.map((row) => (
            <ModuleTestRunner
              key={row.testId}
              moduleId={data.moduleId}
              moduleTitle={data.moduleTitle}
              moduleOrderNumber={data.moduleOrderNumber}
              moduleDescription={row.moduleDescription}
              attemptCount={row.attemptCount}
              maxAttempts={testMaxAttempts}
              testId={row.testId}
              title={row.title}
              minScore={row.minScore}
              questions={row.questions}
              lastAttempt={row.lastAttempt}
              nextStep={data.nextStep}
              modulePathSteps={data.modulePathSteps}
              learning={data.learning}
              aiMentorConfigured={data.aiMentorConfigured}
            />
          ))}
        </div>
      </LearnPageShell>
    </DashboardShell>
  );
}
