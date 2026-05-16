"use client";

import { useEffect, useRef, useState } from "react";
import { LessonRichText } from "@/components/lesson/lesson-rich-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Turn = { id: string; role: "user" | "assistant"; content: string };

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type Props = {
  moduleId: string;
  practicalTaskId: string;
  className?: string;
};

/**
 * Встроенная панель подсказок к практике: запросы уходят в /api/ai/chat с practiceSocraticHints
 * (наставник задаёт наводящие вопросы, без готового решения).
 */
export function PracticeSocraticHintPanel({ moduleId, practicalTaskId, className }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, loading]);

  async function onSend() {
    const text = draft.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          module_id: moduleId,
          practical_task_id: practicalTaskId,
          practice_socratic_hints: true,
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
      setError("Не удалось связаться с сервером.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-primary/25 bg-linear-to-br from-primary/6 to-card p-4 shadow-sm ring-1 ring-inset ring-primary/10",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">AI-наставник</p>
          <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
            Не ответ, а наводящие вопросы — чтобы вы сами дошли до решения.
          </p>
        </div>
        <Button type="button" size="sm" variant={open ? "secondary" : "outline"} onClick={() => setOpen((v) => !v)}>
          {open ? "Свернуть" : "Нужна подсказка?"}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <div ref={scrollRef} className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-background/60 p-2">
            {messages.length === 0 ? (
              <p className="text-pretty px-1 text-xs text-muted-foreground">
                Опишите, на каком шаге застряли, или что уже проверили — наставник ответит вопросами.
              </p>
            ) : null}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs",
                  m.role === "user" ? "ml-3 bg-primary/12 text-foreground" : "mr-2 bg-muted/90 text-foreground",
                )}
              >
                {m.role === "assistant" ? <LessonRichText source={m.content} /> : <p className="whitespace-pre-wrap">{m.content}</p>}
              </div>
            ))}
            {loading ? (
              <p className="text-xs text-muted-foreground">Наставник думает…</p>
            ) : null}
            {error ? (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Например: не понимаю, с чего начать анализ…"
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
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={() => setMessages([])}>
              Очистить
            </Button>
            <Button type="button" size="sm" loading={loading} disabled={!draft.trim()} onClick={() => void onSend()}>
              Спросить
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
