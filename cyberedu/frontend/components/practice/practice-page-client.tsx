"use client";

import { useState } from "react";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import {
  formatPracticePublicInstructions,
  formatPracticeScenarioSummary,
} from "@/lib/practice-mentor-ai-context";
import {
  buildPracticeMentorSafeContext,
  practiceMentorContextLabels,
  type PracticeMentorChatBoot,
} from "@/lib/practice-mentor-panel";
import { PracticeLabTaskSession } from "@/components/practice/practice-lab-task-session";
import { practicePageHeadingLabel } from "@/lib/practice-a11y";
import type {
  ClientPracticalTask,
  ClientSubmission,
  PracticeLabModuleContext,
  PracticePageTask,
} from "@/lib/practice-page-types";

export type { ClientPracticalTask, ClientSubmission, PracticeLabModuleContext, PracticePageTask };

export type PracticePageClientProps = {
  moduleId: string;
  moduleTitle: string;
  labContext: PracticeLabModuleContext;
  tasks: PracticePageTask[];
  aiMentorConfigured: boolean;
};

export function PracticePageClient({
  moduleId,
  moduleTitle,
  labContext,
  tasks,
  aiMentorConfigured,
}: PracticePageClientProps) {
  const defaultChatTaskId = tasks.length === 1 ? tasks[0].runtime.id : null;
  const [chatOpenSeq, setChatOpenSeq] = useState(0);
  const [mentorTaskId, setMentorTaskId] = useState<string | null>(defaultChatTaskId);
  const [mentorBoot, setMentorBoot] = useState<PracticeMentorChatBoot | null>(null);
  const [mentorLabels, setMentorLabels] = useState(() =>
    tasks.length === 1
      ? practiceMentorContextLabels(
          buildPracticeMentorSafeContext({
            moduleId,
            practicalTaskId: tasks[0].runtime.id,
            taskTitle: tasks[0].view.title,
            moduleTitle: labContext.moduleTitle,
            taskType: tasks[0].runtime.taskType,
            scenarioSummary: formatPracticeScenarioSummary(tasks[0].view.scenario),
            publicInstructionsPreview: formatPracticePublicInstructions(tasks[0].view.instructions),
          }),
        )
      : { moduleTitle, topic: moduleTitle },
  );

  function openMentorChat(task: PracticePageTask, boot: PracticeMentorChatBoot) {
    setMentorTaskId(task.runtime.id);
    setMentorBoot(boot);
    setMentorLabels(
      practiceMentorContextLabels(
        buildPracticeMentorSafeContext({
          moduleId,
          practicalTaskId: task.runtime.id,
          taskTitle: task.view.title,
          moduleTitle: labContext.moduleTitle,
          taskType: task.runtime.taskType,
        }),
      ),
    );
    setChatOpenSeq((n) => n + 1);
  }

  const chatTaskId = mentorTaskId ?? defaultChatTaskId;

  const multiTask = tasks.length > 1;

  return (
    <div className="space-y-8">
      {multiTask ? (
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {practicePageHeadingLabel(moduleTitle)}
        </h1>
      ) : null}
      {tasks.map((task, index) => (
        <PracticeLabTaskSession
          key={task.runtime.id}
          moduleId={moduleId}
          labContext={labContext}
          task={task}
          taskIndex={index}
          taskCount={tasks.length}
          taskAnchorId={`practice-lab-${task.runtime.id}`}
          nextPracticeAnchor={
            tasks[index + 1] ? `#practice-lab-${tasks[index + 1].runtime.id}` : null
          }
          courseHref="/dashboard/course"
          aiMentorConfigured={aiMentorConfigured}
          onOpenMentorChat={(boot) => openMentorChat(task, boot)}
        />
      ))}
      <AiMentorChat
        moduleId={moduleId}
        practicalTaskId={chatTaskId ?? undefined}
        aiConfigured={aiMentorConfigured}
        openSignal={chatOpenSeq}
        bootPrompt={mentorBoot?.prompt}
        bootModeId={mentorBoot?.modeId ?? null}
        contextLabels={mentorLabels}
      />
    </div>
  );
}
