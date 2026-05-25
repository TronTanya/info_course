"use client";

import { MentorMessageSkeleton } from "@/components/ai/mentor/mentor-message-skeleton";
import { MentorTypingIndicator } from "@/components/ai/mentor/mentor-typing";

/** Состояние ожидания ответа: индикатор «печатает» + skeleton (ЭТАП 16). */
export function MentorLoadingState({ streaming = false }: { streaming?: boolean }) {
  const label = streaming ? "Наставник формирует ответ" : "Ожидание ответа наставника";

  return (
    <div className="space-y-2" role="status" aria-busy="true" aria-label={label}>
      <MentorTypingIndicator />
      <MentorMessageSkeleton />
    </div>
  );
}
