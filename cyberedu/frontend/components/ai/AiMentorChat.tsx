"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Scan } from "lucide-react";
import { MentorContextBar } from "@/components/ai/mentor/mentor-context-bar";
import { MentorEmptyState } from "@/components/ai/mentor/mentor-empty-state";
import { MentorErrorBanner } from "@/components/ai/mentor/mentor-error-banner";
import { MentorGuardrailCallout } from "@/components/ai/mentor/mentor-guardrail-callout";
import { MentorMarkdown } from "@/components/ai/mentor/mentor-markdown";
import { MentorMemoryStrip } from "@/components/ai/mentor/mentor-memory-strip";
import { MentorMessageMeta } from "@/components/ai/mentor/mentor-message-meta";
import { MentorModesBar } from "@/components/ai/mentor/mentor-modes-bar";
import { MentorSuggestedPrompts } from "@/components/ai/mentor/mentor-suggested-prompts";
import { MentorTypingIndicator } from "@/components/ai/mentor/mentor-typing";
import { buildMentorModePrompt, type MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { resolveMentorContextKind } from "@/lib/ai/mentor-ui/context";
import { getSuggestedPrompts } from "@/lib/ai/mentor-ui/suggested-prompts";
import type { MentorChatTurn, MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import { useOverlayA11y } from "@/lib/hooks/use-overlay-a11y";
import { cn } from "@/lib/utils";

export type { MentorContextLabels, MentorChatTurn as ChatTurn };

export type AiMentorChatProps = {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
  contextLabels?: MentorContextLabels;
  openSignal?: number;
};

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type ChatApiResponse = {
  reply?: string;
  error?: string;
  meta?: TutorPipelineMeta;
};

/**
 * Плавающий SOC-панель AI cybersecurity mentor. Backend: POST /api/ai/chat без изменений.
 */
export function AiMentorChat({
  moduleId,
  lessonId,
  practicalTaskId,
  contextLabels = {},
  openSignal,
}: AiMentorChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MentorChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryDraft, setRetryDraft] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevOpenSignal = useRef<number | null>(null);
  const reduce = useReducedMotion();

  useOverlayA11y({
    open,
    onClose: () => setOpen(false),
    containerRef: panelRef,
  });

  const contextKind = useMemo(
    () => resolveMentorContextKind({ moduleId, lessonId, practicalTaskId }),
    [moduleId, lessonId, practicalTaskId],
  );
  const suggested = useMemo(() => getSuggestedPrompts(contextKind), [contextKind]);

  const serverMemoryNote =
    messages.length > 0
      ? "сервер помнит последние реплики по этой странице"
      : "контекст страницы передаётся при первом сообщении";

  useEffect(() => {
    function onOpenMentor() {
      setError(null);
      setOpen(true);
    }
    window.addEventListener("cyberedu:open-mentor", onOpenMentor);
    return () => window.removeEventListener("cyberedu:open-mentor", onOpenMentor);
  }, []);

  useEffect(() => {
    if (openSignal === undefined) return;
    if (prevOpenSignal.current !== null && openSignal !== prevOpenSignal.current) {
      setError(null);
      setOpen(true);
    }
    prevOpenSignal.current = openSignal;
  }, [openSignal]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            module_id: moduleId ?? null,
            lesson_id: lessonId ?? null,
            practical_task_id: practicalTaskId ?? null,
            practice_socratic_hints: contextKind === "practice",
          }),
        });

        const data = (await res.json()) as ChatApiResponse;

        if (!res.ok) {
          setRetryDraft(trimmed);
          setError(data.error || `Ошибка ${res.status}`);
          return;
        }

        const reply = data.reply?.trim();
        if (!reply) {
          setRetryDraft(trimmed);
          setError("Пустой ответ сервера.");
          return;
        }

        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "user", content: trimmed },
          { id: nextId(), role: "assistant", content: reply, meta: data.meta },
        ]);
        setDraft("");
        setRetryDraft(null);
      } catch {
        setRetryDraft(trimmed);
        setError("Не удалось связаться с сервером. Проверьте сеть и попробуйте снова.");
      } finally {
        setLoading(false);
      }
    },
    [loading, moduleId, lessonId, practicalTaskId, contextKind],
  );

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") return messages[i];
    }
    return null;
  }, [messages]);

  function handleModeSelect(modeId: MentorModeId) {
    void sendMessage(buildMentorModePrompt(modeId, contextKind));
  }

  function handleRetry() {
    const text = retryDraft ?? draft;
    if (text.trim()) void sendMessage(text);
  }

  function clearLocal() {
    setMessages([]);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="ai-mentor-chat-panel"
        aria-label={open ? "Закрыть AI-наставника" : "Открыть AI-наставника"}
        onClick={() => {
          setError(null);
          setOpen((v) => !v);
        }}
        className={cn(
          "ce-ai-mentor-fab ce-touch-target fixed z-[60] flex size-14 min-h-14 min-w-14 items-center justify-center rounded-full",
          "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]",
          "ce-mentor-fab-surface border border-cyan/40 text-cyan shadow-(--shadow-glow)",
          "transition hover:scale-[1.03] motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
          open && "ring-2 ring-cyan/60 ring-offset-2 ring-offset-background",
        )}
      >
        {open ? (
          <span className="text-2xl leading-none text-foreground" aria-hidden>
            ×
          </span>
        ) : (
          <Bot className="size-6" aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id="ai-mentor-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-mentor-chat-title"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "ce-ai-mentor-panel ce-mentor-soc fixed z-[60] flex flex-col overflow-hidden",
              "inset-x-0 bottom-0 max-h-[min(88dvh,40rem)] w-full rounded-t-2xl border-t border-cyan/25",
              "sm:inset-x-auto sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:right-[max(1.25rem,env(safe-area-inset-right))]",
              "sm:max-h-[min(78dvh,36rem)] sm:w-[min(100vw-2rem,28rem)] sm:rounded-2xl sm:border",
            )}
          >
            <div className="ce-mentor-scanline pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

            <header className="ce-mentor-header relative flex items-start justify-between gap-2 border-b px-4 py-3">
              <div className="min-w-0">
                <p id="ai-mentor-chat-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Scan className="size-4 text-cyan" aria-hidden />
                  AI-наставник CyberEdu
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  Встроенный учебный помощник: объяснения, примеры и подсказки без готовых ответов.
                </p>
              </div>
              <button
                type="button"
                className="ce-touch-target shrink-0 rounded-xl p-2.5 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
              >
                <span className="text-lg leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </header>

            <MentorContextBar kind={contextKind} labels={contextLabels} moduleId={moduleId} />

            <MentorModesBar disabled={loading} onSelect={handleModeSelect} />

            <div ref={scrollRef} className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3">
              {messages.length === 0 && !loading ? <MentorEmptyState /> : null}

              {messages.map((m) => (
                <motion.article
                  key={m.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  className={cn(
                    "ce-mentor-bubble rounded-xl border px-3 py-2.5 text-sm",
                    m.role === "user"
                      ? "ml-6 border-primary/25 bg-primary/10"
                      : "ce-mentor-bubble-assistant mr-1",
                  )}
                >
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {m.role === "user" ? "Вы" : "Наставник"}
                  </p>
                  {m.role === "assistant" ? (
                    <>
                      <MentorMarkdown source={m.content} />
                      <MentorMessageMeta meta={m.meta} />
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap text-foreground">{m.content}</p>
                  )}
                </motion.article>
              ))}

              {loading ? <MentorTypingIndicator /> : null}

              {error ? <MentorErrorBanner message={error} onRetry={handleRetry} disabled={loading} /> : null}

              {lastAssistant?.meta?.refused || lastAssistant?.meta?.refusalCode === "exam_spoiler" ? (
                <MentorGuardrailCallout refusalCode={lastAssistant.meta?.refusalCode} />
              ) : null}
            </div>

            <MentorSuggestedPrompts
              prompts={messages.length === 0 ? suggested : suggested.slice(0, 3)}
              disabled={loading}
              onSelect={(t) => void sendMessage(t)}
            />

            <div className="border-t border-cyan/15 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Textarea
                label="Сообщение наставнику"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Сформулируйте вопрос для наставника…"
                rows={2}
                className="ce-mentor-input min-h-[64px] resize-none text-sm sm:min-h-[72px]"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(draft);
                  }
                }}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" size="sm" loading={loading} disabled={!draft.trim()} onClick={() => void sendMessage(draft)}>
                  Отправить
                </Button>
              </div>
            </div>

            <MentorMemoryStrip
              localCount={messages.length}
              serverNote={serverMemoryNote}
              onClearLocal={clearLocal}
              disabled={loading}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
