"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PracticeLabLayout } from "@/components/layout/practice-lab-layout";
import { PracticeAIMentorPanel } from "@/components/practice/practice-ai-mentor-panel";
import { PracticeLabAside } from "@/components/practice/practice-lab-aside";
import { PracticeLabAnswerArea } from "@/components/practice/practice-lab-answer-area";
import { PracticeLabEvidence } from "@/components/practice/practice-lab-evidence";
import { PracticeLabHeader } from "@/components/practice/practice-lab-header";
import { PracticeHints } from "@/components/practice/practice-hints";
import { PracticeSubmissionForm } from "@/components/practice/practice-submission-form";
import { ScenarioPanel } from "@/components/practice/scenario-panel";
import { TaskInstructions } from "@/components/practice/task-instructions";
import { PracticeLabWorkspace } from "@/components/practice/practice-lab-workspace";
import { PracticeLabResult } from "@/components/practice/practice-lab-result";
import { PracticeLabSkeleton } from "@/components/practice/practice-lab-skeleton";
import { getPracticeLabState } from "@/lib/practice-lab-ui";
import { buildPracticeMentorSafeContext, type PracticeMentorChatBoot } from "@/lib/practice-mentor-panel";
import { resolvePracticeClientErrorDisplay } from "@/lib/practice-page-state";
import { practiceStepBreadcrumbs } from "@/lib/student-nav";
import type { PracticeLabModuleContext, PracticePageTask } from "@/lib/practice-page-types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PendingBanner } from "@/components/ui/pending-banner";
import { SectionCard } from "@/components/ui/section-card";
import { useToast } from "@/components/ui/toast";
import { practiceLabTitleId, resolvePracticeLabTitleLevel } from "@/lib/practice-a11y";

function taskTypeRu(taskType: PracticePageTask["runtime"]["taskType"]): string {
  const m: Record<string, string> = {
    TEXT_ANSWER: "Текстовый ответ",
    FILE_UPLOAD: "Загрузка файла",
    INTERACTIVE: "Интерактивная проверка",
    COMBINED: "Комбинированное задание",
    SITUATION_CHOICE: "Ситуации и выбор",
    PASSWORD_ANALYSIS: "Анализ паролей",
    PHISHING_ANALYSIS: "Разбор фишинга",
    CHECKLIST: "Чек-лист",
    URL_ANALYSIS: "Анализ ссылок",
    TRAINING_CONSOLE: "Учебная консоль",
    CRYPTO_TASK: "Криптография",
    LOG_ANALYSIS: "Анализ журнала",
  };
  return m[taskType] ?? taskType;
}

export function PracticeLabTaskSession({
  moduleId,
  labContext,
  task,
  taskIndex = 0,
  taskCount = 1,
  taskAnchorId,
  courseHref,
  aiMentorConfigured,
  onOpenMentorChat,
}: {
  moduleId: string;
  labContext: PracticeLabModuleContext;
  task: PracticePageTask;
  taskIndex?: number;
  taskCount?: number;
  taskAnchorId: string;
  nextPracticeAnchor: string | null;
  courseHref: string;
  aiMentorConfigured: boolean;
  onOpenMentorChat: (boot: PracticeMentorChatBoot) => void;
}) {
  const router = useRouter();
  const { view, runtime } = task;
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [checkFlash, setCheckFlash] = useState<"correct" | "wrong" | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const sub = runtime.latestSubmission;
  const labState = getPracticeLabState(sub, { flash: checkFlash });
  const workspaceId = "practice-workspace";

  function onMessage(err: string | null, ok: string | null) {
    const safeErr = err ? resolvePracticeClientErrorDisplay(err).message : null;
    setError(safeErr);
    setInfo(ok);
    if (safeErr) {
      setCheckFlash("wrong");
      toast({ title: "Проверка не пройдена", description: safeErr, variant: "error" });
    } else if (ok) {
      setCheckFlash(/верно|засчитан/i.test(ok) ? "correct" : null);
      toast({ title: /верно|засчитан/i.test(ok) ? "Верно" : "Отправлено", description: ok, variant: "success" });
      router.refresh();
    } else {
      setCheckFlash(null);
    }
  }

  const latestForScenario = sub ? { status: sub.status, adminComment: sub.adminComment } : null;
  const answerRequirements = view.safeRubric.map((r) => r.title).slice(0, 6);
  const mentorContext = buildPracticeMentorSafeContext({
    moduleId,
    practicalTaskId: runtime.id,
    taskTitle: view.title,
    moduleTitle: labContext.moduleTitle,
    taskType: runtime.taskType,
  });

  const breadcrumb = (
    <Breadcrumbs items={practiceStepBreadcrumbs(moduleId, labContext.moduleOrderNumber)} />
  );

  const titleLevel = resolvePracticeLabTitleLevel(taskIndex, taskCount);

  const header = (
    <PracticeLabHeader
      view={view}
      courseTitle={labContext.courseTitle}
      courseHref={courseHref}
      moduleHref={`/dashboard/course/${moduleId}`}
      workspaceAnchorId={workspaceId}
      titleLevel={titleLevel}
    />
  );

  const main = (
    <div id={taskAnchorId} className="ce-practice-lab-main scroll-mt-24 min-w-0 space-y-6">
      <PracticeLabResult
        labState={labState}
        error={error}
        info={info}
        needsRevision={view.status === "needs_retry"}
        revisionComment={view.submission?.feedback ?? sub?.adminComment}
        accepted={view.status === "approved"}
        showIntro={view.status === "not_started" || view.status === "in_progress"}
        pendingReview={view.status === "pending_review" || view.status === "submitted"}
      />
      {pending ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <PendingBanner label="Проверка на сервере…" />
          <PracticeLabSkeleton />
        </div>
      ) : null}

      <ScenarioPanel scenario={view.scenario ?? null} />

      <TaskInstructions instructions={view.instructions} safeRubric={view.safeRubric} />

      <PracticeLabEvidence items={view.evidenceItems} taskType={runtime.taskType} />

      <PracticeHints hints={view.hints} moduleId={moduleId} practiceId={runtime.id} />

      <PracticeLabWorkspace
        id={workspaceId}
        taskTypeLabel={taskTypeRu(runtime.taskType)}
        componentLabel={{ en: runtime.taskType, ru: view.title }}
      >
        <PracticeLabAnswerArea requirements={answerRequirements}>
          <PracticeSubmissionForm
            moduleId={moduleId}
            runtime={runtime}
            view={view}
            latestSubmission={latestForScenario}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
            workspaceAnchorId={workspaceId}
            onMentorAction={onOpenMentorChat}
            console={
              runtime.taskType === "TRAINING_CONSOLE"
                ? {
                    consoleScenario: runtime.consoleScenario,
                    hasStructuredCommandStep: runtime.hasStructuredCommandStep,
                    hasStructuredExplanationStep: runtime.hasStructuredExplanationStep,
                    minLength: runtime.minLength,
                  }
                : null
            }
          />
        </PracticeLabAnswerArea>
      </PracticeLabWorkspace>

      {sub?.fileDownloadUrl ? (
        <SectionCard variant="muted" flushTitle className="p-4">
          <a className="font-medium text-primary underline-offset-4 hover:underline" href={sub.fileDownloadUrl}>
            Скачать прикреплённый файл
          </a>
        </SectionCard>
      ) : null}
    </div>
  );

  const mentorPanel = (
    <PracticeAIMentorPanel
      aiConfigured={aiMentorConfigured}
      context={mentorContext}
      onOpenMentorChat={onOpenMentorChat}
    />
  );

  const aside = (
    <>
      <PracticeLabAside
        moduleId={moduleId}
        practicalTaskId={runtime.id}
        labState={labState}
        checklist={[]}
        attemptCount={runtime.attemptCount}
        recommendations={[
          `Максимум баллов: ${runtime.maxScore}.`,
          ...answerRequirements.slice(0, 3),
        ]}
        moduleProgress={labContext.moduleProgress}
        mentorContext={mentorContext}
        aiMentorConfigured={aiMentorConfigured}
        onOpenMentorChat={onOpenMentorChat}
        showMentorPanel={false}
      />
      <div className="hidden min-w-0 lg:block">{mentorPanel}</div>
    </>
  );

  return (
    <article
      className="min-w-0"
      aria-labelledby={practiceLabTitleId(view.id)}
      data-practice-task-id={runtime.id}
    >
      <PracticeLabLayout
        breadcrumb={breadcrumb}
        header={header}
        main={main}
        aside={aside}
        mobileAfterMain={mentorPanel}
      />
    </article>
  );
}
