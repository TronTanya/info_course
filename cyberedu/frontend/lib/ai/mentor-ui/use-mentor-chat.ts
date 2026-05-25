"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildMentorModePrompt, type MentorModeId } from "@/lib/ai/mentor-ui/modes";
import {
  clearMentorChatHistory,
  fetchMentorChatHistory,
} from "@/lib/ai/mentor-ui/chat-history-client";
import {
  postMentorChat,
  resolveMentorChatFailureMessage,
  MENTOR_MAX_PROMPT_LENGTH,
  buildMentorChatBody,
} from "@/lib/ai/mentor-ui/chat-client";
import {
  mentorChatErrorMessage,
  resolveMentorPanelPhase,
  type MentorDisabledReason,
  type MentorErrorKind,
  type MentorPanelPhase,
} from "@/lib/ai/mentor-ui/chat-state";
import { resolveMentorContextKind } from "@/lib/ai/mentor-ui/context";
import { resolveMentorSurface, type MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import type { SuggestedPrompt } from "@/lib/ai/mentor-ui/suggested-prompts";
import type { MentorChatTurn, MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { AIMentorContextInput } from "@/types/ai-mentor";

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export type UseMentorChatOptions = {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
  contextLabels?: MentorContextLabels;
  aiConfigured?: boolean;
  disabledReason?: MentorDisabledReason | null;
  testDebriefTopics?: string | null;
  openSignal?: number;
  bootModeId?: MentorModeId | null;
  bootPrompt?: string | null;
  streamingSupported?: boolean;
  mentorContext?: AIMentorContextInput | null;
  /** Явная поверхность (страница /mentor). */
  forceSurface?: MentorSurface;
  /** Подсказки вместо дефолтных по contextKind. */
  suggestedPrompts?: SuggestedPrompt[];
};

export function useMentorChat({
  moduleId,
  lessonId,
  practicalTaskId,
  contextLabels = {},
  aiConfigured = true,
  disabledReason = null,
  testDebriefTopics = null,
  openSignal,
  bootModeId = null,
  bootPrompt = null,
  streamingSupported = false,
  mentorContext = null,
  forceSurface,
}: UseMentorChatOptions) {
  const [messages, setMessages] = useState<MentorChatTurn[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<MentorErrorKind>("generic");
  const [retryDraft, setRetryDraft] = useState<string | null>(null);
  const [selectedModeId, setSelectedModeId] = useState<MentorModeId | null>(null);

  const submitLock = useRef(false);
  const prevOpenSignal = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef({ moduleId, lessonId, practicalTaskId });

  const chatEnabled = aiConfigured && !disabledReason;
  const contextKind = useMemo(
    () => resolveMentorContextKind({ moduleId, lessonId, practicalTaskId }, contextLabels),
    [moduleId, lessonId, practicalTaskId, contextLabels],
  );
  const mentorSurface = useMemo(
    () =>
      forceSurface ??
      resolveMentorSurface({
        moduleId,
        lessonId,
        practicalTaskId,
        labels: contextLabels,
        standalone: !moduleId && !lessonId && !practicalTaskId,
      }),
    [forceSurface, moduleId, lessonId, practicalTaskId, contextLabels],
  );

  const panelPhase: MentorPanelPhase = useMemo(
    () =>
      resolveMentorPanelPhase({
        chatEnabled,
        disabledReason,
        loading,
        error,
        messageCount: messages.length,
      }),
    [chatEnabled, disabledReason, loading, error, messages.length],
  );

  const draftLen = draft.length;
  const draftOverLimit = draftLen > MENTOR_MAX_PROMPT_LENGTH;

  const historyQuery = useMemo(
    () => ({ moduleId, lessonId, practicalTaskId }),
    [moduleId, lessonId, practicalTaskId],
  );

  const serverMemoryNote = useMemo(() => {
    if (mentorSurface === "practice") {
      return "на практике история только в этой сессии (ответы не сохраняются в БД)";
    }
    if (messages.length > 0) {
      return "сервер помнит последние реплики по этой странице";
    }
    return "контекст страницы передаётся при первом сообщении";
  }, [mentorSurface, messages.length]);

  const reloadHistory = useCallback(async () => {
    if (!chatEnabled || mentorSurface === "practice") {
      setHistoryHydrated(true);
      return;
    }
    setHistoryLoading(true);
    const result = await fetchMentorChatHistory(historyQuery);
    if (result.ok) {
      setMessages(result.messages);
    }
    setHistoryLoading(false);
    setHistoryHydrated(true);
  }, [chatEnabled, mentorSurface, historyQuery]);

  useEffect(() => {
    const prev = scopeRef.current;
    const scopeChanged =
      prev.moduleId !== moduleId ||
      prev.lessonId !== lessonId ||
      prev.practicalTaskId !== practicalTaskId;
    scopeRef.current = { moduleId, lessonId, practicalTaskId };

    if (scopeChanged) {
      setMessages([]);
      setHistoryHydrated(false);
      setError(null);
      setRetryDraft(null);
    }

    if (!historyHydrated || scopeChanged) {
      void reloadHistory();
    }
  }, [moduleId, lessonId, practicalTaskId, historyHydrated, reloadHistory]);

  const sendMessage = useCallback(
    async (text: string, modeId?: MentorModeId | null) => {
      const trimmed = text.trim();
      if (!trimmed || loading || submitLock.current) return;
      if (trimmed.length > MENTOR_MAX_PROMPT_LENGTH) {
        setErrorKind("generic");
        setError(`Сообщение слишком длинное (максимум ${MENTOR_MAX_PROMPT_LENGTH} символов).`);
        return;
      }

      if (!chatEnabled) {
        setErrorKind(disabledReason === "unauthorized" ? "unauthorized" : "config");
        setError(mentorChatErrorMessage(disabledReason === "unauthorized" ? "unauthorized" : "config"));
        return;
      }

      submitLock.current = true;
      setError(null);
      setLoading(true);
      setStreaming(streamingSupported);
      const effectiveMode = modeId ?? null;
      if (effectiveMode) setSelectedModeId(effectiveMode);

      const userTurn: MentorChatTurn = {
        id: nextId(),
        role: "user",
        content: trimmed,
        createdAt: nowIso(),
        mode: effectiveMode ?? undefined,
      };
      setMessages((prev) => [...prev, userTurn]);

      const body = buildMentorChatBody(
        {
          message: trimmed,
          moduleId,
          lessonId,
          practicalTaskId,
          practiceSocraticHints: mentorSurface === "practice",
          mentorModeId: effectiveMode,
          testDebriefTopics: testDebriefTopics ?? undefined,
        },
        contextLabels,
        mentorContext,
      );

      const result = await postMentorChat(body);

      if (!result.ok) {
        setRetryDraft(trimmed);
        const { kind, message } = resolveMentorChatFailureMessage(result);
        setErrorKind(kind);
        setError(message);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: result.reply,
            meta: result.meta,
            createdAt: nowIso(),
            mode: effectiveMode ?? undefined,
          },
        ]);
        setDraft("");
        setRetryDraft(null);
        queueMicrotask(() => {
          inputRef.current?.focus();
          liveRef.current?.focus({ preventScroll: true });
        });
      }

      setLoading(false);
      setStreaming(false);
      setSelectedModeId(null);
      submitLock.current = false;
    },
    [
      loading,
      chatEnabled,
      disabledReason,
      moduleId,
      lessonId,
      practicalTaskId,
      mentorSurface,
      contextLabels,
      testDebriefTopics,
      streamingSupported,
      mentorContext,
    ],
  );

  useEffect(() => {
    if (openSignal === undefined) return;
    const prev = prevOpenSignal.current;
    const signalChanged = prev !== null && openSignal !== prev;
    const pendingAfterLazyLoad = prev === null && openSignal > 0;
    if (signalChanged || pendingAfterLazyLoad) {
      queueMicrotask(() => {
        setError(null);
        if (!chatEnabled) return;
        const prompt = bootPrompt?.trim();
        if (prompt) {
          void sendMessage(prompt, bootModeId ?? undefined);
        } else if (bootModeId) {
          void sendMessage(buildMentorModePrompt(bootModeId, contextKind), bootModeId);
        }
      });
    }
    prevOpenSignal.current = openSignal;
  }, [openSignal, bootModeId, bootPrompt, contextKind, sendMessage, chatEnabled]);

  const clearConversation = useCallback(async () => {
    setClearing(true);
    setMessages([]);
    setError(null);
    setRetryDraft(null);
    setDraft("");
    if (chatEnabled && mentorSurface !== "practice") {
      await clearMentorChatHistory(historyQuery);
    }
    setClearing(false);
    inputRef.current?.focus();
  }, [chatEnabled, mentorSurface, historyQuery]);

  function handleRetry() {
    const text = retryDraft ?? draft;
    if (text.trim()) void sendMessage(text, selectedModeId);
  }

  function applySuggestedPrompt(text: string) {
    if (!chatEnabled) return;
    setSelectedModeId(null);
    setDraft(text);
    setError(null);
    queueMicrotask(() => inputRef.current?.focus());
  }

  return {
    messages,
    draft,
    setDraft,
    loading,
    historyLoading,
    clearing,
    serverMemoryNote,
    streaming: streaming && loading,
    error,
    errorKind,
    retryDraft,
    selectedModeId,
    chatEnabled,
    disabledReason,
    panelPhase,
    contextKind,
    mentorSurface,
    draftLen,
    draftOverLimit,
    maxPromptLength: MENTOR_MAX_PROMPT_LENGTH,
    inputRef,
    liveRef,
    sendMessage,
    clearConversation,
    handleRetry,
    handleModeSelect: (modeId: MentorModeId, starterPrompt: string) => {
      if (!chatEnabled) return;
      setSelectedModeId(modeId);
      setDraft(starterPrompt);
      setError(null);
      queueMicrotask(() => inputRef.current?.focus());
    },
    applySuggestedPrompt,
  };
}

export type { MentorDisabledReason, MentorErrorKind, MentorPanelPhase };
