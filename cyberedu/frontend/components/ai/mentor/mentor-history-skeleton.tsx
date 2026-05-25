"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Плейсхолдер при загрузке истории с сервера. */
export function MentorHistorySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Загрузка истории диалога">
      <div className="ml-6 space-y-1.5 rounded-xl border border-cyan/20 bg-cyan/5 px-3 py-2.5">
        <Skeleton className="h-2.5 w-12" shimmer />
        <Skeleton className="h-3 w-[78%]" shimmer />
      </div>
      <div className="ce-mentor-bubble-assistant mr-1 space-y-1.5 rounded-xl border px-3 py-2.5">
        <Skeleton className="h-2.5 w-16" shimmer />
        <Skeleton className="h-3 w-full max-w-[92%]" shimmer />
        <Skeleton className="h-3 w-[80%]" shimmer />
      </div>
      <div className="ml-6 space-y-1.5 rounded-xl border border-cyan/20 bg-cyan/5 px-3 py-2.5">
        <Skeleton className="h-2.5 w-12" shimmer />
        <Skeleton className="h-3 w-[65%]" shimmer />
      </div>
    </div>
  );
}
