"use client";

import { GraduationCap } from "lucide-react";
import type { TutorRefusalCode } from "@/lib/ai/tutor/types";

const HINTS: Partial<Record<TutorRefusalCode, string>> = {
  exam_spoiler:
    "Наставник не выдаёт готовые ответы на тесты и практику. Сформулируйте, что уже пробовали, и попросите подсказку или проверку понимания.",
  offensive_attack:
    "Запросы на атакующие действия отклоняются. Спросите, как распознать угрозу или какие меры защиты применяют.",
  policy_blocked: "Вопрос вне учебной политики. Переформулируйте по материалам модуля или защите в легальном контексте.",
  prompt_injection: "Роль наставника нельзя переопределить через чат. Задайте обычный учебный вопрос.",
};

export function MentorGuardrailCallout({ refusalCode }: { refusalCode?: TutorRefusalCode }) {
  const text =
    (refusalCode && HINTS[refusalCode]) ||
    "Ответ построен в учебном формате: без готовых решений и без атакующих инструкций.";

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      <p className="flex items-center gap-2 font-medium text-warning">
        <GraduationCap className="size-3.5 shrink-0" aria-hidden />
        Учебные ограничения
      </p>
      <p className="mt-1 text-pretty">{text}</p>
    </div>
  );
}
