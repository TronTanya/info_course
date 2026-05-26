"use client";

import { BookOpen, Shield } from "lucide-react";

export function MentorEmptyState() {
  return (
    <div className="ce-mentor-empty ce-polish-inset rounded-xl border-dashed px-4 py-4 text-sm">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <BookOpen className="size-4 text-cyan" aria-hidden />
        Учебный помощник
      </p>
      <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
        Задайте вопрос по лекции, тесту или практике. Наставник адаптирует сложность, задаёт наводящие вопросы и не
        выдаёт готовые ответы на проверку знаний.
      </p>
      <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Shield className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
        <span>Выберите режим сверху или быстрый запрос — ответ появится в чате.</span>
      </p>
    </div>
  );
}
