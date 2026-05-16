"use client";

import { useEffect, useRef, useState } from "react";
import { LessonRichText } from "@/components/lesson/lesson-rich-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ChatTurn = { id: string; role: "user" | "assistant"; content: string };

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type AiMentorChatProps = {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
  /** Увеличьте значение, чтобы программно открыть панель чата. */
  openSignal?: number;
};

function MentorSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent", className)}
      aria-hidden
    />
  );
}

/**
 * Отдельный AI-чат наставник: плавающая кнопка, панель, история, загрузка и ошибки.
 * Контекст на сервер уходит только в безопасном виде (см. POST /api/ai/chat).
 */
export function AiMentorChat({ moduleId, lessonId, practicalTaskId, openSignal }: AiMentorChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevOpenSignal = useRef<number | null>(null);

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

  function closePanel() {
    setOpen(false);
  }

  function openPanel() {
    setError(null);
    setOpen(true);
  }

  async function onSend() {
    const text = draft.trim();
    if (!text || loading) return;

    setError(null);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          module_id: moduleId ?? null,
          lesson_id: lessonId ?? null,
          practical_task_id: practicalTaskId ?? null,
          history,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok) {
        setError(data.error || `Ошибка ${res.status}`);
        return;
      }

      const reply = data.reply?.trim();
      if (!reply) {
        setError("Пустой ответ сервера.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: text },
        { id: nextId(), role: "assistant", content: reply },
      ]);
      setDraft("");
    } catch {
      setError("Не удалось связаться с сервером. Проверьте сеть и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="ai-mentor-chat-panel"
        aria-label={open ? "Закрыть чат с AI-наставником" : "Открыть чат с AI-наставником"}
        onClick={() => (open ? closePanel() : openPanel())}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-lg transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        )}
      >
        {open ? (
          <span className="text-2xl leading-none" aria-hidden>
            ×
          </span>
        ) : (
          <span className="text-xs font-bold leading-tight tracking-wide" aria-hidden>
            AI
          </span>
        )}
      </button>

      {open ? (
        <div
          id="ai-mentor-chat-panel"
          className="fixed bottom-[5.5rem] right-5 z-50 flex w-[min(100vw-2.5rem,24rem)] max-h-[min(72vh,34rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-mentor-chat-title"
        >
          <div className="flex items-start justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="min-w-0">
              <p id="ai-mentor-chat-title" className="text-sm font-semibold text-foreground">
                AI-наставник
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                Помощник, а не решатель: без готовых ответов на тесты и практику — наводящие вопросы и безопасные объяснения.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Закрыть чат"
              onClick={closePanel}
            >
              <span className="text-lg leading-none" aria-hidden>
                ×
              </span>
            </button>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Спроси про термины, логику задания или что уже пробовал(а). Если спросишь «как сделать задание», наставник
                поможет разобрать формулировку, а не сдаст его за тебя.
              </p>
            ) : null}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm",
                  m.role === "user" ? "ml-5 bg-primary/15 text-foreground" : "mr-3 bg-muted/80 text-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  <LessonRichText source={m.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}

            {loading ? (
              <div className="mr-3 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                <MentorSpinner />
                <span>Наставник печатает…</span>
              </div>
            ) : null}

            {error ? (
              <div
                className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-xs text-danger"
                role="alert"
              >
                {error}
              </div>
            ) : null}
          </div>

          <div className="border-t border-border p-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ваш вопрос…"
              rows={3}
              className="min-h-[72px] text-sm"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void onSend();
                }
              }}
            />
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setMessages([])} disabled={loading}>
                Очистить историю
              </Button>
              <Button type="button" size="sm" loading={loading} onClick={() => void onSend()} disabled={!draft.trim()}>
                Отправить
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
