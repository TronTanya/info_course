"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildMentorLiveAnnouncement,
  MENTOR_MESSAGES_LIVE_ID,
} from "@/lib/ai/mentor-ui/mentor-a11y";
import { Bot, Eraser } from "lucide-react";
import { MentorComposer } from "@/components/ai/mentor/mentor-composer";
import { MentorDisabledState } from "@/components/ai/mentor/mentor-disabled-state";
import { MentorEmptyState } from "@/components/ai/mentor/mentor-empty-state";
import { MentorErrorBanner } from "@/components/ai/mentor/mentor-error-banner";
import { MentorGuardrailNote } from "@/components/ai/mentor/mentor-guardrail-note";
import { MentorHistorySkeleton } from "@/components/ai/mentor/mentor-history-skeleton";
import { MentorMessageList } from "@/components/ai/mentor/mentor-message-list";
import { AIModeSelector } from "@/components/ai/ai-mode-selector";
import { MentorSuggestedPrompts } from "@/components/ai/mentor/mentor-suggested-prompts";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { getSuggestedPrompts, type SuggestedPrompt } from "@/lib/ai/mentor-ui/suggested-prompts";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { LESSON_MENTOR_DEFAULT_MODE_IDS } from "@/lib/lesson-mentor-panel";
import { TEST_MENTOR_DEFAULT_MODE_IDS } from "@/lib/test-mentor-panel";
import {
  useMentorChat,
  type MentorDisabledReason,
} from "@/lib/ai/mentor-ui/use-mentor-chat";
import {
  shouldShowMentorDisabledState,
  shouldShowMentorEmptyState,
  shouldShowMentorErrorBanner,
} from "@/lib/ai/mentor-ui/chat-state";
import { buildContextSubtitle } from "@/lib/ai/mentor-ui/context";
import { getMentorClearConfirmMessage } from "@/lib/ai/mentor-ui/mentor-a11y";
import { cn } from "@/lib/utils";

export type AIMentorChatPanelProps = {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
  contextLabels?: MentorContextLabels;
  aiConfigured?: boolean;
  /** Причина недоступности чата (закрытый контент, нет ключа, не авторизован). */
  disabledReason?: MentorDisabledReason | null;
  disabledHint?: string | null;
  testDebriefTopics?: string | null;
  openSignal?: number;
  bootModeId?: MentorModeId | null;
  bootPrompt?: string | null;
  streamingSupported?: boolean;
  mentorContext?: AIMentorContextInput | null;
  forceSurface?: MentorSurface;
  /** Полноэкранная страница `/dashboard/mentor`: другой хедер и плотнее сообщения. */
  pageLayout?: "standalone";
  embedded?: boolean;
  suggestedPrompts?: SuggestedPrompt[];
  onClose?: () => void;
  showCloseButton?: boolean;
  titleId?: string;
  className?: string;
};

/**
 * Учебная панель чата AI-наставника (сообщения, composer, a11y).
 * Оболочка FAB/dialog — в `AiMentorChat`.
 */
export function AIMentorChatPanel({
  moduleId,
  lessonId,
  practicalTaskId,
  contextLabels = {},
  aiConfigured = true,
  disabledReason = null,
  disabledHint = null,
  testDebriefTopics = null,
  openSignal,
  bootModeId = null,
  bootPrompt = null,
  streamingSupported = false,
  mentorContext = null,
  forceSurface,
  pageLayout,
  embedded = false,
  suggestedPrompts: suggestedPromptsProp,
  onClose,
  showCloseButton = false,
  titleId = "ai-mentor-chat-title",
  className,
}: AIMentorChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const resolvedDisabledReason: MentorDisabledReason | null =
    disabledReason ?? (!aiConfigured ? "no_api_key" : null);

  const {
    messages,
    draft,
    setDraft,
    loading,
    historyLoading,
    clearing,
    streaming,
    error,
    errorKind,
    selectedModeId,
    chatEnabled,
    panelPhase,
    contextKind,
    mentorSurface,
    draftLen,
    draftOverLimit,
    inputRef,
    liveRef,
    sendMessage,
    clearConversation,
    handleRetry,
    handleModeSelect,
    applySuggestedPrompt,
  } = useMentorChat({
    moduleId,
    lessonId,
    practicalTaskId,
    contextLabels,
    aiConfigured,
    disabledReason: resolvedDisabledReason,
    testDebriefTopics,
    openSignal,
    bootModeId,
    bootPrompt,
    streamingSupported,
    mentorContext,
    forceSurface,
    suggestedPrompts: suggestedPromptsProp,
  });

  const suggested = useMemo(
    () => suggestedPromptsProp ?? getSuggestedPrompts(contextKind),
    [suggestedPromptsProp, contextKind],
  );

  const contextSubtitle = useMemo(
    () => buildContextSubtitle(contextKind, contextLabels, moduleId),
    [contextKind, contextLabels, moduleId],
  );

  const refusalTopicLabel =
    contextLabels.topic?.trim() || contextLabels.moduleTitle?.trim() || undefined;

  const showHistorySkeleton = historyLoading;
  const showEmpty = shouldShowMentorEmptyState(panelPhase) && !showHistorySkeleton;
  const showDisabled = shouldShowMentorDisabledState(panelPhase);
  const showError = shouldShowMentorErrorBanner(panelPhase);
  const showStarterTools = chatEnabled && showEmpty;
  const isPageLayout = pageLayout === "standalone";

  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const lastAnnouncedAssistantId = useRef<string | null>(null);

  useEffect(() => {
    const { text, lastAssistantId } = buildMentorLiveAnnouncement({
      loading,
      historyLoading,
      error,
      showError,
      showDisabled,
      messages,
      lastAnnouncedAssistantId: lastAnnouncedAssistantId.current,
    });
    if (lastAssistantId) lastAnnouncedAssistantId.current = lastAssistantId;
    if (text) setLiveAnnouncement(text);
  }, [loading, historyLoading, error, messages, showError, showDisabled]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    const scrollToEnd = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToEnd();
    requestAnimationFrame(scrollToEnd);
  }, [messages, loading, streaming, error]);

  const panelDisabled = !chatEnabled || loading || historyLoading;
  const clearsServerHistory = mentorSurface !== "practice";

  function handleClear() {
    if (messages.length > 0) {
      const ok = window.confirm(getMentorClearConfirmMessage(clearsServerHistory));
      if (!ok) return;
    }
    void clearConversation();
  }

  return (
    <div
      className={cn(
        "ce-ai-mentor-panel ce-mentor-theme relative flex min-h-0 flex-col border-border/80 bg-card",
        isPageLayout ? "overflow-visible overflow-x-clip" : "overflow-hidden overflow-x-clip",
        embedded && "ce-ai-mentor-panel--embedded",
        isPageLayout && "ce-ai-mentor-panel--page",
        className,
      )}
    >
      <header
        className={cn(
          "ce-mentor-header relative flex shrink-0 items-start justify-between gap-2 border-b",
          isPageLayout ? "px-4 py-3" : "px-3 py-2.5 sm:px-4",
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            id={titleId}
            className={cn(
              "flex items-center gap-2 font-medium text-foreground",
              isPageLayout ? "text-sm sm:text-base" : "text-sm",
            )}
          >
            {isPageLayout ? (
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan"
                aria-hidden
              >
                <Bot className="size-4" strokeWidth={1.75} />
              </span>
            ) : null}
            <span className="min-w-0">
              <span className="block font-display font-semibold tracking-tight">
                {isPageLayout ? "Диалог" : "Наставник"}
              </span>
              {contextSubtitle ? (
                <span
                  className="mt-0.5 block truncate text-xs font-normal text-muted-foreground"
                  title={contextSubtitle}
                >
                  {contextSubtitle}
                </span>
              ) : null}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {chatEnabled && messages.length > 0 ? (
            <button
              type="button"
              className="ce-touch-target rounded-lg p-2 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Очистить диалог"
              disabled={loading || clearing}
              onClick={handleClear}
            >
              <Eraser className="size-4" aria-hidden />
            </button>
          ) : null}
          {showCloseButton && onClose ? (
            <button
              type="button"
              className="ce-touch-target rounded-lg p-2 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Закрыть"
              onClick={onClose}
            >
              <span className="text-lg leading-none" aria-hidden>
                ×
              </span>
            </button>
          ) : null}
        </div>
      </header>

      {!isPageLayout ? (
        <div className="shrink-0 px-3 pb-1 pt-1 sm:px-4">
          <MentorGuardrailNote />
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className={cn(
          "ce-mentor-messages relative space-y-3 overflow-x-clip",
          isPageLayout
            ? "ce-mentor-messages--page px-4 py-3 sm:px-5"
            : "min-h-[9rem] flex-1 overflow-y-auto overscroll-y-auto px-3 py-2 sm:min-h-[10rem] sm:py-3",
        )}
        role="log"
        aria-label="История диалога с наставником"
        aria-relevant="additions"
      >
        <div
          ref={liveRef}
          id={MENTOR_MESSAGES_LIVE_ID}
          tabIndex={-1}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveAnnouncement}
        </div>

        {showDisabled ? (
          <MentorDisabledState
            reason={resolvedDisabledReason ?? "no_api_key"}
            hint={disabledHint}
          />
        ) : null}

        {showHistorySkeleton ? <MentorHistorySkeleton /> : null}

        {showEmpty ? <MentorEmptyState /> : null}

        <MentorMessageList
          messages={messages}
          loading={loading}
          streaming={streaming}
          topicLabel={refusalTopicLabel}
          onRefusalAction={applySuggestedPrompt}
          layout={isPageLayout ? "page" : "default"}
        />
      </div>

      {showStarterTools ? (
        <div className="ce-mentor-starter shrink-0 space-y-2 border-t border-border/60 px-3 py-2 sm:px-4">
          <AIModeSelector
            disabled={panelDisabled}
            selectedModeId={selectedModeId}
            surface={mentorSurface}
            contextKind={contextKind}
            allowedModeIds={
              mentorSurface === "lesson"
                ? LESSON_MENTOR_DEFAULT_MODE_IDS
                : mentorSurface === "test_result"
                  ? TEST_MENTOR_DEFAULT_MODE_IDS
                  : undefined
            }
            onModeSelect={handleModeSelect}
            variant="compact"
          />
          <MentorSuggestedPrompts
            prompts={suggested.slice(0, 2)}
            disabled={panelDisabled}
            onSelect={applySuggestedPrompt}
            variant="compact"
          />
        </div>
      ) : null}

      {showError && error ? (
        <div className="shrink-0 px-3 pb-2">
          <MentorErrorBanner
            message={error}
            kind={errorKind}
            onRetry={handleRetry}
            disabled={loading}
          />
        </div>
      ) : null}

      <MentorComposer
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={() => void sendMessage(draft, selectedModeId)}
        selectedModeId={selectedModeId}
        disabled={!chatEnabled}
        loading={loading}
        chatEnabled={chatEnabled}
        draftLen={draftLen}
        draftOverLimit={draftOverLimit}
        inputRef={inputRef}
        hasComposerError={showError && Boolean(error)}
      />
    </div>
  );
}
