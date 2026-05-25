"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AIMentorChatPanel } from "@/components/ai/ai-mentor-chat-panel";
import { MentorPageHero } from "@/components/mentor/mentor-page-hero";
import {
  MentorPageCapabilities,
  MentorPageContextSelector,
  MentorPageSafeExamples,
  MentorPageUsageRules,
  MentorPageWeakTopicsHighlight,
} from "@/components/mentor/mentor-page-sidebar";
import { MENTOR_UNAVAILABLE } from "@/lib/ai/mentor-ui/constants";
import type { SuggestedPrompt } from "@/lib/ai/mentor-ui/suggested-prompts";
import {
  buildMentorPageAIMentorContext,
  buildMentorPageContextLabels,
  buildMentorPageContextOptions,
  buildMentorPageWeakTopics,
  mentorPageModuleId,
  MENTOR_STANDALONE_SAFE_EXAMPLES,
  resolveDefaultMentorPageScope,
  type MentorPageContextScope,
} from "@/lib/mentor-standalone-page";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { StudentNavModuleSync } from "@/components/layout/student-nav-module-sync";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const STANDALONE_SUGGESTED: SuggestedPrompt[] = MENTOR_STANDALONE_SAFE_EXAMPLES.map((ex) => ({
  id: ex.id,
  label: ex.label,
  text: ex.text,
}));

export function MentorStandalonePageClient({
  stats,
  modules,
  aiMentorConfigured,
}: {
  stats: ProfileCourseStats | null;
  modules: CourseProgressModuleRow[];
  aiMentorConfigured: boolean;
}) {
  const weakTopics = useMemo(() => buildMentorPageWeakTopics(stats, modules), [stats, modules]);
  const contextOptions = useMemo(
    () => buildMentorPageContextOptions(stats, weakTopics),
    [stats, weakTopics],
  );

  const [contextScope, setContextScope] = useState<MentorPageContextScope>(() =>
    resolveDefaultMentorPageScope(stats, weakTopics),
  );
  const [openSeq, setOpenSeq] = useState(0);
  const [bootPrompt, setBootPrompt] = useState<string | null>(null);

  const mentorContext = useMemo(
    () => buildMentorPageAIMentorContext(contextScope, stats, modules, weakTopics),
    [contextScope, stats, modules, weakTopics],
  );
  const contextLabels = useMemo(
    () => buildMentorPageContextLabels(contextScope, stats, modules),
    [contextScope, stats, modules],
  );
  const chatModuleId = useMemo(
    () => mentorPageModuleId(contextScope, stats),
    [contextScope, stats],
  );

  function launch(prompt: string) {
    const t = prompt.trim();
    if (!t || !aiMentorConfigured) return;
    setBootPrompt(t);
    setOpenSeq((n) => n + 1);
  }

  function onScopeChange(scope: MentorPageContextScope) {
    setContextScope(scope);
    setBootPrompt(null);
  }

  const sidebar = (
    <aside
      className="ce-mentor-page-sidebar flex min-w-0 flex-col gap-3"
      aria-label="Настройки наставника"
    >
      <MentorPageContextSelector
        options={contextOptions}
        value={contextScope}
        disabled={!aiMentorConfigured}
        onChange={onScopeChange}
      />
      {contextScope === "weak_topics" ? <MentorPageWeakTopicsHighlight topics={weakTopics} /> : null}
      <MentorPageSafeExamples disabled={!aiMentorConfigured} onSelect={launch} />
      <MentorPageCapabilities />
      <MentorPageUsageRules />
    </aside>
  );

  const chatClassName = "ce-mentor-page-chat rounded-[inherit] border-0";

  if (!stats) {
    return (
      <div className="ce-mentor-page min-w-0 space-y-4">
        <StudentNavModuleSync stats={null} modules={modules} />
        <MentorPageHero stats={null} weakTopicsCount={0} />
        <PremiumCard padding="md" className="min-w-0 border-cyan/15">
          <p className="text-sm text-muted-foreground">
            Нет данных курса — доступен только режим «Общий вопрос».{" "}
            <Link href="/dashboard/course" className="font-semibold text-primary underline-offset-4 hover:underline">
              Откройте карту курса
            </Link>
            , чтобы подключить контекст модуля.
          </p>
          <div className="ce-mentor-page-chat-wrap mt-4 rounded-2xl border border-cyan/20">
            <AIMentorChatPanel
              aiConfigured={aiMentorConfigured}
              mentorContext={{ sourceType: "general", safeTopic: "Кибербезопасность" }}
              contextLabels={{ topic: "Общий вопрос" }}
              forceSurface="standalone"
              pageLayout="standalone"
              embedded
              suggestedPrompts={STANDALONE_SUGGESTED}
              openSignal={openSeq}
              bootPrompt={bootPrompt}
              className={chatClassName}
              titleId="mentor-page-chat-title"
            />
          </div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="ce-mentor-page min-w-0 space-y-4">
      <StudentNavModuleSync stats={stats} modules={modules} />
      <MentorPageHero stats={stats} weakTopicsCount={weakTopics.length} />

      {!aiMentorConfigured ? (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning" role="status">
          {MENTOR_UNAVAILABLE}
        </p>
      ) : null}

      <div className="ce-mentor-page__body grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(13.5rem,16rem)_minmax(0,1fr)] lg:items-stretch">
        <div className="ce-mentor-page-sidebar-shell rounded-2xl border border-border/70 bg-card/40 p-3 backdrop-blur-sm sm:p-3.5">
          {sidebar}
        </div>

        <div
          className={cn(
            "ce-mentor-page-chat-wrap rounded-2xl",
            "border border-cyan/25 shadow-[0_0_40px_-16px_color-mix(in_oklab,var(--cyan)_35%,transparent)]",
          )}
        >
          <AIMentorChatPanel
            moduleId={chatModuleId}
            aiConfigured={aiMentorConfigured}
            contextLabels={contextLabels}
            mentorContext={mentorContext}
            forceSurface="standalone"
            pageLayout="standalone"
            embedded
            suggestedPrompts={STANDALONE_SUGGESTED}
            openSignal={openSeq}
            bootPrompt={bootPrompt}
            className={chatClassName}
            titleId="mentor-page-chat-title"
          />
        </div>
      </div>
    </div>
  );
}
