"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { markLessonStudiedAction, regenerateLessonAiAction, runLessonAiAction } from "@/lib/actions/lesson";
import { parseLessonAiMeta, type LessonAiAction } from "@/lib/lesson-ai-meta";
import { buildLessonContentLegendItems } from "@/lib/lesson-content-legend";
import {
  extractPracticeBlock,
  extractRememberBlock,
  getLessonDifficultyLabel,
} from "@/lib/lesson-page-ui";
import {
  formatLessonEstimatedTime,
  lessonStatusPresentation,
} from "@/lib/lesson-view-mapper";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { preloadMentorChat } from "@/components/ai/ai-mentor-chat-lazy";
import { LessonStickyCta } from "@/components/lesson/lesson-sticky-cta";
import { LessonAiAdaptationPanel } from "@/components/lesson/lesson-ai-adaptation-panel";
import { LessonContentRenderer, parseLessonStructure, type LessonSegment } from "@/components/lesson/lesson-content-renderer";
import { LessonOutline } from "@/components/lesson/lesson-outline";
import { buildLessonOutline } from "@/lib/lesson-outline-ui";
import { useLessonReadingProgress } from "@/components/lesson/lesson-reading-progress";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { LessonCompletionCard } from "@/components/lesson/lesson-completion-card";
import { LessonBreadcrumbs } from "@/components/lesson/premium/lesson-breadcrumbs";
import { useToast } from "@/components/ui/toast";
import { LessonMainContent } from "@/components/lesson/premium/lesson-main-content";
import { LessonAIMentorPanel } from "@/components/lesson/premium/lesson-ai-mentor-panel";
import { buildLessonAIMentorContextInput } from "@/lib/lesson-mentor-ai-context";
import {
  buildLessonMentorSafeContext,
  lessonMentorContextLabels,
} from "@/lib/lesson-mentor-panel";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { MiniCheckpoint } from "@/components/lesson/mini-checkpoint";
import { LessonKeyTerms } from "@/components/lesson/premium/lesson-key-terms";
import { LessonObjectives } from "@/components/lesson/premium/lesson-objectives";
import { LessonPremiumLayout } from "@/components/lesson/premium/lesson-premium-layout";
import { LessonProgressAside } from "@/components/lesson/premium/lesson-progress-aside";
import { LessonRightSidebar } from "@/components/lesson/premium/lesson-right-sidebar";
import { LessonNavigation } from "@/components/lesson/lesson-navigation";
import { LessonOpenedTracker } from "@/components/analytics/learn-screen-trackers";
import type { LessonPageClientProps, LessonAiSnapshotClient } from "@/components/lesson/lesson-page-client";
import type { LearningStepLink } from "@/lib/learning-nav";
import { lessonLinkAsLearningStep, type LessonLink } from "@/types/lesson-view-model";
import { LessonClientErrorBanner } from "@/components/lesson/lesson-page-states";
import { resolveLessonClientErrorDisplay } from "@/lib/lesson-page-state";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatRuDateTimeShortUtc } from "@/lib/datetime-stable";
import { openMentorChat } from "@/lib/ai/mentor-ui/open";

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function LessonVideo({ url }: { url: string }) {
  const u = url.trim();
  if (!u) return null;
  const yt = extractYoutubeId(u);
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-card ring-1 ring-primary/15">
        <iframe
          title="Видео к лекции"
          className="size-full"
          src={`https://www.youtube.com/embed/${yt}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  return <video className="w-full rounded-2xl border border-border shadow-card" controls src={u} preload="metadata" />;
}

function toClientSnapshot(row: {
  id: string;
  adaptedContent: string;
  interestsUsed: string;
  createdAt: Date;
}): LessonAiSnapshotClient {
  return {
    id: row.id,
    adaptedContent: row.adaptedContent,
    interestsUsed: row.interestsUsed,
    createdAt: row.createdAt.toISOString(),
  };
}

export function LessonPremiumScreen(props: LessonPageClientProps) {
  const {
    moduleId,
    moduleProgressPercent,
    moduleStepsLabel,
    learning,
    view,
    videoUrl,
    allowAiAdaptation,
    mentorAiConfigured,
    explanationAdaptation,
    summaryAdaptation,
  } = props;

  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const lessonCompleted = view.status === "completed";
  const readingPercent = useLessonReadingProgress(contentRef, lessonCompleted);

  const practice = useMemo(() => extractPracticeBlock(view.content), [view.content]);
  const remember = useMemo(() => extractRememberBlock(view.content), [view.content]);
  const difficulty = getLessonDifficultyLabel(view.moduleNumber ?? 1);
  const readingTimeLabel = formatLessonEstimatedTime(view.estimatedMinutes ?? 0, Boolean(videoUrl));
  const status = lessonStatusPresentation(view.status, readingPercent, view.lockedReason);
  const isLessonLocked = view.status === "locked";

  const [contentTab, setContentTab] = useState<"lesson" | "ai" | "summary">("lesson");
  const [explanationSnap, setExplanationSnap] = useState(explanationAdaptation);
  const [summarySnap, setSummarySnap] = useState(summaryAdaptation);
  const [markPending, setMarkPending] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionSuccess, setCompletionSuccess] = useState<string | null>(null);
  const { toast } = useToast();
  const [askOpen, setAskOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [mentorOpenSignal, setMentorOpenSignal] = useState(0);
  const [mentorBootModeId, setMentorBootModeId] = useState<MentorModeId | null>(null);
  const [mentorBootPrompt, setMentorBootPrompt] = useState<string | null>(null);

  const mentorSafeContext = useMemo(
    () =>
      buildLessonMentorSafeContext({
        moduleId,
        lessonId: view.id,
        title: view.title,
        moduleTitle: view.moduleTitle,
      }),
    [moduleId, view.id, view.title, view.moduleTitle],
  );

  const mentorChatLabels = useMemo(
    () => lessonMentorContextLabels(mentorSafeContext),
    [mentorSafeContext],
  );

  const lessonMentorContext = useMemo(
    () =>
      isLessonLocked
        ? null
        : buildLessonAIMentorContextInput({
            moduleId,
            lessonId: view.id,
            lessonTitle: view.title,
            moduleTitle: view.moduleTitle,
            safeTopic: view.moduleTitle,
            description: view.description,
            objectives: view.objectives,
            keyTerms: view.keyTerms,
          }),
    [
      isLessonLocked,
      moduleId,
      view.id,
      view.title,
      view.moduleTitle,
      view.description,
      view.objectives,
      view.keyTerms,
    ],
  );

  const mentorChatEnabled = allowAiAdaptation && mentorAiConfigured && !isLessonLocked;

  const testHref = view.nextTest?.href ?? `/dashboard/course/${moduleId}/test`;
  const moduleHref = `/dashboard/course/${moduleId}`;
  const courseHref = "/dashboard/course";
  const hasTest = learning.steps.some((s) => s.kind === "test");
  const hasPractice = learning.steps.some((s) => s.kind === "practice");
  const nextStepRaw = view.nextLesson ?? learning.neighbors.next;
  const nextStepForCta = useMemo((): LearningStepLink | null => {
    if (!nextStepRaw) return learning.neighbors.next;
    if ("label" in nextStepRaw && typeof nextStepRaw.label === "string") {
      return nextStepRaw;
    }
    return lessonLinkAsLearningStep(nextStepRaw as LessonLink);
  }, [nextStepRaw, learning.neighbors.next]);

  useEffect(() => {
    queueMicrotask(() => {
      setExplanationSnap(explanationAdaptation);
      setSummarySnap(summaryAdaptation);
    });
  }, [explanationAdaptation, summaryAdaptation]);

  useEffect(() => {
    if (mentorChatEnabled) preloadMentorChat();
  }, [mentorChatEnabled]);

  function applyAdaptation(
    action: LessonAiAction,
    row: { id: string; adaptedContent: string; interestsUsed: string; createdAt: Date },
  ) {
    const snap = toClientSnapshot(row);
    if (action === "summary") setSummarySnap(snap);
    else setExplanationSnap(snap);
  }

  function handleContentTab(key: "lesson" | "ai" | "summary") {
    if (key === contentTab) return;
    setContentTab(key);
    if (aiBusy || !allowAiAdaptation) return;
    if (key === "ai" && !explanationSnap && !aiBusy) void runAi("simpler");
    if (key === "summary" && !summarySnap && !aiBusy) void runAi("summary");
  }

  async function runAi(action: LessonAiAction, question?: string) {
    if (aiBusy) return;
    setError(null);
    setAiBusy(true);
    try {
      const res = await runLessonAiAction({ moduleId, lessonId: view.id, action, question });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.adaptation) applyAdaptation(action, res.adaptation);
      setContentTab(action === "summary" ? "summary" : "ai");
    } finally {
      setAiBusy(false);
    }
  }

  async function onRegenerate(kind: "explanation" | "summary") {
    setError(null);
    setAiBusy(true);
    try {
      const res = await regenerateLessonAiAction({ moduleId, lessonId: view.id, kind });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.adaptation) {
        const action =
          parseLessonAiMeta(res.adaptation.interestsUsed)?.action ?? (kind === "summary" ? "summary" : "simpler");
        applyAdaptation(action, res.adaptation);
      }
      setContentTab(kind === "summary" ? "summary" : "ai");
    } finally {
      setAiBusy(false);
    }
  }

  async function onMarkStudied() {
    if (lessonCompleted || markPending) return;

    setError(null);
    setCompletionSuccess(null);
    setMarkPending(true);
    try {
      const res = await markLessonStudiedAction(moduleId);
      if (res.error) {
        const { message } = resolveLessonClientErrorDisplay(res.error);
        setError(res.error);
        toast({
          title: "Не удалось завершить урок",
          description: message,
          variant: "error",
        });
        return;
      }
      const message = "Прогресс сохранён. Контрольный тест модуля теперь доступен.";
      setCompletionSuccess(message);
      toast({
        title: "Урок завершён",
        description: message,
        variant: "success",
      });
      router.refresh();
    } finally {
      setMarkPending(false);
    }
  }

  function onOpenMentorChat(bootModeId?: MentorModeId, bootPrompt?: string) {
    if (!mentorChatEnabled) return;
    setMentorBootModeId(bootModeId ?? null);
    setMentorBootPrompt(bootPrompt?.trim() || null);
    setMentorOpenSignal((n) => n + 1);
    openMentorChat();
  }

  const skipTypes = useMemo(() => {
    const types: ("remember" | "mini_case" | "how")[] = [];
    if (remember) types.push("remember");
    if (practice) types.push("mini_case", "how");
    return types;
  }, [remember, practice]);

  const bodySkipTypes = useMemo((): LessonSegment["type"][] => {
    const skip = new Set<LessonSegment["type"]>(skipTypes);
    const segments = parseLessonStructure(view.content);
    const intro = segments.find((s) => s.type === "intro");
    const why = segments.find((s) => s.type === "why");
    if (intro && intro.type === "intro" && intro.body.trim()) skip.add("intro");
    else if (why && why.type === "why" && why.body.trim()) skip.add("why");
    return [...skip];
  }, [view.content, skipTypes]);

  const outlineItems = useMemo(
    () =>
      buildLessonOutline({
        content: view.content,
        bodySkipTypes,
        hasCheckpointQuestions: view.checkpoints.length > 0,
      }),
    [view.content, bodySkipTypes, view.checkpoints.length],
  );

  const contentLegendItems = useMemo(
    () => buildLessonContentLegendItems(view.content),
    [view.content],
  );

  const continueTarget = lessonCompleted
    ? view.nextTest && !view.nextTest.disabled
      ? view.nextTest
      : view.nextPractice && !view.nextPractice.disabled
        ? view.nextPractice
        : nextStepRaw
    : nextStepRaw;

  const mentorPanelProps = {
    allowAiAdaptation,
    aiConfigured: mentorAiConfigured,
    lessonLocked: isLessonLocked,
    aiBusy,
    context: mentorSafeContext,
    onOpenMentorChat,
  } as const;

  const top = (
    <>
      <LessonBreadcrumbs
        courseTitle={learning.courseTitle}
        courseHref={courseHref}
        moduleTitle={view.moduleTitle}
        moduleId={view.moduleId}
        lessonTitle={view.title}
      />
      <LessonHeader
        courseHref={courseHref}
        moduleNumber={view.moduleNumber ?? 1}
        lessonNumber={view.lessonNumber ?? 1}
        lessonTitle={view.title}
        description={view.description ?? null}
        readingTimeLabel={readingTimeLabel}
        status={status}
        readingPercent={readingPercent}
        lessonCompleted={lessonCompleted}
        lockedReason={view.lockedReason ?? null}
        continueHref={continueTarget?.disabled ? null : (continueTarget?.href ?? null)}
        continueLabel={
          continueTarget
            ? "title" in continueTarget
              ? continueTarget.title
              : "label" in continueTarget
                ? continueTarget.label
                : "Продолжить"
            : "Продолжить"
        }
        continueDisabled={continueTarget?.disabled}
        difficulty={difficulty}
        onAskMentor={mentorChatEnabled ? onOpenMentorChat : undefined}
        compact={lessonCompleted}
      />
    </>
  );

  return (
    <>
      <LessonOpenedTracker moduleId={moduleId} lessonId={view.id} />
      <LessonPremiumLayout
        top={top}
        modules={learning.modules}
        steps={learning.steps}
        rightSidebar={
          <LessonRightSidebar
            outline={
              <LessonOutline items={outlineItems} containerRef={contentRef} placement="sidebar" />
            }
            mentor={
              <LessonAIMentorPanel
                {...mentorPanelProps}
                panelId="lesson-ai-mentor-desktop"
                placement="sidebar"
              />
            }
            progress={
              lessonCompleted ? null : (
                <LessonProgressAside
                  moduleProgressPercent={moduleProgressPercent}
                  moduleStepsLabel={moduleStepsLabel}
                  lessonCompleted={lessonCompleted}
                  difficulty={difficulty}
                  steps={learning.steps}
                  lessonReadingPercent={readingPercent}
                />
              )
            }
          />
        }
        mobileCta={
          <LessonStickyCta
            lessonCompleted={lessonCompleted}
            markPending={markPending}
            onMarkStudied={onMarkStudied}
            testHref={testHref}
            nextStep={nextStepForCta}
            onAskMentor={mentorChatEnabled ? onOpenMentorChat : undefined}
            showMentor={mentorChatEnabled}
          />
        }
      >
        <article
          ref={contentRef}
          className="ce-lesson-page__content lesson-reading min-w-0 w-full max-w-none space-y-4 overflow-x-clip sm:space-y-5"
          aria-labelledby="lesson-main-heading"
        >
          <LessonOutline items={outlineItems} containerRef={contentRef} placement="inline" />

          {error ? <LessonClientErrorBanner error={error} /> : null}

          <LessonObjectives objectives={view.objectives} description={view.description} />

          <LessonKeyTerms terms={view.keyTerms} />

          <LessonMainContent
            contentTab={contentTab}
            onContentTabChange={handleContentTab}
            allowAiTabs={allowAiAdaptation}
            aiBusy={aiBusy}
            sectionNavItems={[]}
            showSectionNav={false}
            showIntro={false}
            contentLegendItems={contentLegendItems}
            containerRef={contentRef}
            original={
              <div className="space-y-5 sm:space-y-6">
                <LessonContentRenderer source={view.content} skipTypes={bodySkipTypes} width="wide" />
                {videoUrl ? (
                  <section className="space-y-3 scroll-mt-28" aria-labelledby="lesson-video-heading">
                    <h2 id="lesson-video-heading" className="text-xl font-semibold tracking-tight text-foreground">
                      Видео к уроку
                    </h2>
                    <LessonVideo url={videoUrl} />
                  </section>
                ) : null}
              </div>
            }
            ai={
              explanationSnap ? (
                <div className="space-y-4">
                  <LessonAiAdaptationPanel label="AI-объяснение" className="w-full max-w-none">
                    <LessonContentRenderer source={explanationSnap.adaptedContent} width="wide" />
                  </LessonAiAdaptationPanel>
                  <p className="text-xs text-muted-foreground">{formatRuDateTimeShortUtc(explanationSnap.createdAt)}</p>
                  <Button type="button" variant="outline" size="sm" disabled={aiBusy} onClick={() => onRegenerate("explanation")}>
                    Сгенерировать заново
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Генерируем объяснение…</p>
              )
            }
            summary={
              summarySnap ? (
                <div className="space-y-4">
                  <LessonAiAdaptationPanel label="Конспект" className="w-full max-w-none">
                    <LessonContentRenderer source={summarySnap.adaptedContent} width="wide" />
                  </LessonAiAdaptationPanel>
                  <p className="text-xs text-muted-foreground">{formatRuDateTimeShortUtc(summarySnap.createdAt)}</p>
                  {allowAiAdaptation ? (
                    <Button type="button" variant="outline" size="sm" disabled={aiBusy} onClick={() => onRegenerate("summary")}>
                      Сгенерировать заново
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Генерируем конспект…</p>
              )
            }
          />

          <MiniCheckpoint questions={view.checkpoints} />

          <div className="min-w-0 lg:hidden">
            <LessonAIMentorPanel
              {...mentorPanelProps}
              panelId="lesson-ai-mentor-mobile"
              placement="inline"
            />
          </div>

          <div className="ce-lesson-page__footer ce-mobile-card-stack min-w-0 space-y-4 sm:space-y-5">
            <LessonCompletionCard
              lessonStatus={view.status}
              lessonCompleted={lessonCompleted}
              canMarkComplete={view.canMarkComplete}
              canAccessTest={view.canAccessTest}
              canAccessPractice={view.canAccessPractice}
              courseTitle={learning.courseTitle}
              courseHref={courseHref}
              moduleHref={moduleHref}
              nextLesson={view.nextLesson}
              nextTest={view.nextTest}
              nextPractice={view.nextPractice}
              hasTest={hasTest}
              hasPractice={hasPractice}
              markPending={markPending}
              error={error}
              successMessage={completionSuccess}
              lockedReason={view.lockedReason}
              onMarkComplete={onMarkStudied}
            />

            <LessonNavigation
              lessonTitle={view.title}
              lessonCompleted={lessonCompleted}
              courseHref={courseHref}
              courseTitle={learning.courseTitle}
              currentModuleId={moduleId}
              courseModules={learning.modules}
              previousLesson={view.previousLesson}
              nextLesson={view.nextLesson}
              nextTest={view.nextTest}
              nextPractice={view.nextPractice}
              hasTest={hasTest}
              hasPractice={hasPractice}
              canAccessTest={view.canAccessTest}
              canAccessPractice={view.canAccessPractice}
              hubSteps={learning.steps}
            />
          </div>
        </article>
      </LessonPremiumLayout>

      <Modal
        open={askOpen}
        onOpenChange={setAskOpen}
        title="Проверь моё понимание"
        description="Задайте вопрос по материалу — наставник не подскажет ответы на тест или практику."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setAskOpen(false)}>
              Отмена
            </Button>
            <Button
              type="button"
              disabled={aiBusy}
              loading={aiBusy}
              onClick={async () => {
                const q = questionDraft.trim();
                if (!q) return;
                setAskOpen(false);
                await runAi("ask_assistant", q);
                setQuestionDraft("");
              }}
            >
              Отправить
            </Button>
          </>
        }
      >
        <Textarea
          value={questionDraft}
          onChange={(e) => setQuestionDraft(e.target.value)}
          placeholder="Например: чем фишинг отличается от обычного спама?"
          rows={5}
        />
      </Modal>

      <AiMentorChat
        moduleId={moduleId}
        lessonId={mentorSafeContext.lessonId}
        aiConfigured={mentorAiConfigured && allowAiAdaptation}
        disabledReason={
          isLessonLocked ? "content_locked" : !allowAiAdaptation ? "env_off" : null
        }
        contextLabels={mentorChatLabels}
        mentorContext={lessonMentorContext}
        openSignal={mentorOpenSignal}
        bootModeId={mentorBootModeId}
        bootPrompt={mentorBootPrompt}
      />
    </>
  );
}
