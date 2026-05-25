"use client";

import { History } from "lucide-react";
import { formatStudentPreviousAnswerPreview } from "@/lib/practice-feedback-revision-ui";
import { cn } from "@/lib/utils";

export function PracticePreviousAnswerPanel({
  textAnswer,
  className,
}: {
  textAnswer: string | null | undefined;
  className?: string;
}) {
  const formatted = formatStudentPreviousAnswerPreview(textAnswer);
  if (!formatted) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-muted/15 px-4 py-3 ring-1 ring-inset ring-border/40",
        className,
      )}
      role="region"
      aria-label="Предыдущая отправка"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <History className="size-4 shrink-0" aria-hidden />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
          Предыдущий ответ
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatted.isStructured
          ? "Текст прошлой отправки хранится на сервере в структурированном виде."
          : "Можно опираться на прошлую версию при доработке — отредактируйте поля ниже."}
      </p>
      {!formatted.isStructured ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-border/60 bg-background/50 p-3 font-mono text-[11px] whitespace-pre-wrap text-foreground">
          {formatted.preview}
        </pre>
      ) : (
        <p className="mt-3 text-sm text-foreground">{formatted.preview}</p>
      )}
    </div>
  );
}
