"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Плейсхолдер ответа наставника (без текста запроса/ответа). */
export function MentorMessageSkeleton() {
  return (
    <div
      className="ce-mentor-bubble ce-mentor-bubble-assistant mr-1 space-y-2 rounded-xl border px-3 py-2.5"
      aria-busy="true"
      aria-label="Наставник готовит ответ"
    >
      <Skeleton className="h-3 w-20" shimmer />
      <Skeleton className="h-3 w-full max-w-[95%]" shimmer />
      <Skeleton className="h-3 w-[88%]" shimmer />
      <Skeleton className="h-3 w-[72%]" shimmer />
    </div>
  );
}
