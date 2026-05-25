"use client";

import dynamic from "next/dynamic";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export type { AiMentorChatProps } from "./AiMentorChat";

/** Подгрузка чата до клика по быстрым действиям на уроке. */
export function preloadMentorChat() {
  void import("./AiMentorChat");
}

function MentorFabPlaceholder() {
  return (
    <button
      type="button"
      aria-label="Загрузка AI-наставника"
      aria-busy="true"
      disabled
      onMouseEnter={preloadMentorChat}
      onFocus={preloadMentorChat}
      className={cn(
        "ce-ai-mentor-fab ce-touch-target fixed z-[60] flex size-14 min-h-14 min-w-14 items-center justify-center rounded-full",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]",
        "ce-mentor-fab-surface border border-cyan/40 text-cyan opacity-80 shadow-(--shadow-glow)",
      )}
    >
      <Bot className="size-6 animate-pulse" aria-hidden />
    </button>
  );
}

/** Ленивая загрузка чата наставника — не тянет framer-motion и панель в бандл страницы. */
export const AiMentorChatLazy = dynamic(
  () => import("./AiMentorChat").then((m) => m.AiMentorChat),
  { ssr: false, loading: () => <MentorFabPlaceholder /> },
);
