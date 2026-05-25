"use client";

import type { TransitionStartFunction } from "react";
import type { SubmissionStatus } from "@prisma/client";
import {
  ScenarioPracticeBlock,
  type ConsoleScenarioProps,
} from "@/components/practice/scenario-practice-forms";
import { PracticeNextStepPanel } from "@/components/practice/practice-next-step-panel";
import type { PracticeMentorChatBoot } from "@/lib/practice-mentor-panel";
import { PracticePreviousAnswerPanel } from "@/components/practice/practice-previous-answer-panel";
import { PracticeSubmissionAnswerChecklist } from "@/components/practice/practice-submission-answer-checklist";
import { PracticeSubmissionAnswerFile } from "@/components/practice/practice-submission-answer-file";
import { PracticeSubmissionAnswerText } from "@/components/practice/practice-submission-answer-text";
import {
  PracticeSubmissionAnswerCombined,
  PracticeSubmissionAnswerInteractive,
} from "@/components/practice/practice-submission-answers-extra";
import { SubmissionStatusPanel } from "@/components/practice/submission-status-panel";
import { LogAnalysisTask } from "@/components/practice/LogAnalysisTask";
import { UrlAnalysisTask } from "@/components/practice/UrlAnalysisTask";
import {
  practiceAttemptCountLabel,
  resolvePracticeFormAccess,
} from "@/lib/practice-feedback-revision-ui";
import {
  isPracticeSubmissionDisabled,
  resolvePracticeSubmissionAnswerKind,
} from "@/lib/practice-submission-form";
import type { PracticeTaskRuntime, PracticeViewModel } from "@/lib/practice-page-types";

export type PracticeSubmissionFormProps = {
  moduleId: string;
  runtime: PracticeTaskRuntime;
  view: Pick<
    PracticeViewModel,
    | "status"
    | "canSubmit"
    | "canRetry"
    | "title"
    | "submission"
    | "nextStepsPanel"
    | "lockedReason"
  >;
  latestSubmission: { status: SubmissionStatus; adminComment: string | null } | null;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
  console?: ConsoleScenarioProps | null;
  workspaceAnchorId?: string;
  onMentorAction?: (boot: PracticeMentorChatBoot) => void;
};

export function PracticeSubmissionForm({
  moduleId,
  runtime,
  view,
  latestSubmission,
  startTransition,
  pending,
  onMessage,
  console,
  workspaceAnchorId = "practice-workspace",
  onMentorAction,
}: PracticeSubmissionFormProps) {
  const access = resolvePracticeFormAccess(view, runtime.attemptCount);
  const submitDisabled = isPracticeSubmissionDisabled(view.status, view.canSubmit);
  const kind = resolvePracticeSubmissionAnswerKind(runtime.taskType);
  const taskDisabled = submitDisabled || pending;
  const submitFlowProps = {
    practiceTitle: view.title,
    allowsResubmitOnRevision: view.canRetry,
  };

  const seedText =
    access.showPreviousAnswer && view.canRetry
      ? runtime.latestSubmission?.textAnswer
      : null;

  const answerForm = (() => {
    switch (kind) {
      case "text":
        return (
          <PracticeSubmissionAnswerText
            {...submitFlowProps}
            moduleId={moduleId}
            taskId={runtime.id}
            minLength={runtime.minLength}
            seedText={seedText}
            status={view.status}
            submitDisabled={submitDisabled}
            canRetry={view.canRetry}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
          />
        );
      case "checklist":
        return (
          <PracticeSubmissionAnswerChecklist
            {...submitFlowProps}
            moduleId={moduleId}
            taskId={runtime.id}
            scenarioData={runtime.scenarioData}
            status={view.status}
            submitDisabled={submitDisabled}
            canRetry={view.canRetry}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
          />
        );
      case "url_analysis":
        return (
          <UrlAnalysisTask
            {...submitFlowProps}
            moduleId={moduleId}
            practicalTaskId={runtime.id}
            disabled={taskDisabled}
            onResult={onMessage}
          />
        );
      case "log_analysis":
        return (
          <LogAnalysisTask
            {...submitFlowProps}
            moduleId={moduleId}
            practicalTaskId={runtime.id}
            disabled={taskDisabled}
            onResult={onMessage}
          />
        );
      case "file_upload":
        return (
          <PracticeSubmissionAnswerFile
            {...submitFlowProps}
            moduleId={moduleId}
            taskId={runtime.id}
            accept={runtime.fileAccept ?? ""}
            typesLabel={runtime.fileTypesLabel ?? ""}
            maxMb={runtime.fileMaxMb ?? 10}
            status={view.status}
            submitDisabled={submitDisabled}
            canRetry={view.canRetry}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
          />
        );
      case "combined":
        return (
          <PracticeSubmissionAnswerCombined
            {...submitFlowProps}
            moduleId={moduleId}
            taskId={runtime.id}
            minLength={runtime.minLength}
            accept={runtime.fileAccept ?? ""}
            typesLabel={runtime.fileTypesLabel ?? ""}
            maxMb={runtime.fileMaxMb ?? 10}
            status={view.status}
            submitDisabled={submitDisabled}
            canRetry={view.canRetry}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
          />
        );
      case "interactive":
        return (
          <PracticeSubmissionAnswerInteractive
            {...submitFlowProps}
            moduleId={moduleId}
            taskId={runtime.id}
            mode={runtime.interactiveMode}
            consoleScenario={runtime.consoleScenario}
            hasStructuredCommandStep={runtime.hasStructuredCommandStep}
            hasStructuredExplanationStep={runtime.hasStructuredExplanationStep}
            hasAuto={runtime.hasInteractiveAutoCheck}
            minLength={runtime.minLength}
            accepted={latestSubmission?.status === "ACCEPTED"}
            status={view.status}
            submitDisabled={submitDisabled}
            canRetry={view.canRetry}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
          />
        );
      case "scenario":
      default:
        return (
          <ScenarioPracticeBlock
            {...submitFlowProps}
            moduleId={moduleId}
            taskId={runtime.id}
            taskType={runtime.taskType}
            scenarioData={runtime.scenarioData}
            latestSubmission={latestSubmission}
            startTransition={startTransition}
            pending={pending}
            onMessage={onMessage}
            console={runtime.taskType === "TRAINING_CONSOLE" ? console ?? null : null}
          />
        );
    }
  })();

  return (
    <div className="space-y-4">
      {access.showStatusPanel && view.submission ? (
        <SubmissionStatusPanel
          status={view.status}
          submission={view.submission}
          lockedReason={view.lockedReason}
          canRetry={view.canRetry}
          reviseWorkspaceId={workspaceAnchorId}
        />
      ) : null}

      {access.showAttemptCount ? (
        <p className="text-xs text-muted-foreground" role="note">
          {practiceAttemptCountLabel(runtime.attemptCount)}
        </p>
      ) : null}

      {access.showPreviousAnswer ? (
        <PracticePreviousAnswerPanel textAnswer={runtime.latestSubmission?.textAnswer} />
      ) : null}

      {access.showNextStepsPanel && view.nextStepsPanel ? (
        <PracticeNextStepPanel panel={view.nextStepsPanel} onMentorAction={onMentorAction} />
      ) : null}

      {access.showForm ? (
        <div id={workspaceAnchorId} className="scroll-mt-24">
          {answerForm}
        </div>
      ) : null}
    </div>
  );
}
