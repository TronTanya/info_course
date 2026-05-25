"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot } from "lucide-react";
import { AIMentorChatPanel } from "@/components/ai/ai-mentor-chat-panel";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { getMentorDisabledCopy, type MentorDisabledReason } from "@/lib/ai/mentor-ui/chat-state";
import { MENTOR_UNAVAILABLE } from "@/lib/ai/mentor-ui/constants";
import type { MentorChatTurn, MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { useOverlayA11y } from "@/lib/hooks/use-overlay-a11y";
import { useVisualViewportInset } from "@/lib/hooks/use-visual-viewport-inset";
import { consumePendingMentorOpen } from "@/lib/ai/mentor-ui/open";
import { cn } from "@/lib/utils";

export type { MentorContextLabels, MentorChatTurn as ChatTurn };

export type AiMentorChatProps = {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
  contextLabels?: MentorContextLabels;
  /** false — запросы к API отключены (нет ключа на сервере). */
  aiConfigured?: boolean;
  disabledReason?: MentorDisabledReason | null;
  disabledHint?: string | null;
  /** Темы для разбора после теста (без правильных ответов), с клиента. */
  testDebriefTopics?: string | null;
  openSignal?: number;
  /** При изменении `openSignal` — открыть чат и отправить режим (один раз на сигнал). */
  bootModeId?: MentorModeId | null;
  /** Явный текст первого сообщения (приоритет над bootModeId). */
  bootPrompt?: string | null;
  streamingSupported?: boolean;
  mentorContext?: AIMentorContextInput | null;
};

/**
 * Плавающая кнопка + dialog с `AIMentorChatPanel`. Backend: POST /api/ai/chat.
 */
export function AiMentorChat({
  moduleId,
  lessonId,
  practicalTaskId,
  contextLabels = {},
  aiConfigured = true,
  disabledReason = null,
  disabledHint = null,
  testDebriefTopics = null,
  openSignal,
  bootModeId = null,
  bootPrompt = null,
  streamingSupported = false,
  mentorContext = null,
}: AiMentorChatProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevOpenSignal = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const chatEnabled = aiConfigured && !disabledReason;
  const keyboardInset = useVisualViewportInset(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useOverlayA11y({
    open,
    onClose: () => setOpen(false),
    containerRef: panelRef,
  });

  useEffect(() => {
    function onOpenMentor() {
      setOpen(true);
    }
    window.addEventListener("cyberedu:open-mentor", onOpenMentor);
    if (consumePendingMentorOpen()) {
      queueMicrotask(() => setOpen(true));
    }
    return () => window.removeEventListener("cyberedu:open-mentor", onOpenMentor);
  }, []);

  useEffect(() => {
    if (openSignal === undefined) return;
    const prev = prevOpenSignal.current;
    const signalChanged = prev !== null && openSignal !== prev;
    const pendingAfterLazyLoad = prev === null && openSignal > 0;
    if (signalChanged || pendingAfterLazyLoad) {
      queueMicrotask(() => setOpen(true));
    }
    prevOpenSignal.current = openSignal;
  }, [openSignal]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const overlay = open ? (
      <AnimatePresence>
        <motion.button
          type="button"
          key="ai-mentor-backdrop"
          aria-label="Закрыть AI-наставника"
          className="ce-ai-mentor-backdrop fixed inset-0 z-[100] bg-background/55 backdrop-blur-[2px] lg:hidden"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          onClick={() => setOpen(false)}
        />
        <motion.div
          ref={panelRef}
          key="ai-mentor-dialog"
          id="ai-mentor-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-mentor-chat-title"
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={
            keyboardInset > 0
              ? {
                  bottom: keyboardInset,
                  maxHeight: `min(88dvh, calc(100dvh - ${keyboardInset}px - env(safe-area-inset-top, 0px)))`,
                }
              : undefined
          }
          className={cn(
            "ce-ai-mentor-dialog fixed z-[100] flex min-h-0 w-full max-w-[100vw] flex-col overflow-hidden overflow-x-clip",
            "inset-x-0 bottom-0 max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-top,0px)-0.5rem))]",
            "rounded-t-2xl border-t border-border bg-card",
            "sm:inset-x-auto sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:right-[max(1.25rem,env(safe-area-inset-right))]",
            "sm:max-h-[min(78dvh,36rem)] sm:w-[min(100vw-2rem,28rem)] sm:rounded-2xl sm:border",
          )}
        >
          <AIMentorChatPanel
            moduleId={moduleId}
            lessonId={lessonId}
            practicalTaskId={practicalTaskId}
            contextLabels={contextLabels}
            aiConfigured={aiConfigured}
            disabledReason={disabledReason}
            disabledHint={disabledHint}
            testDebriefTopics={testDebriefTopics}
            openSignal={openSignal}
            bootModeId={bootModeId}
            bootPrompt={bootPrompt}
            streamingSupported={streamingSupported}
            mentorContext={mentorContext}
            onClose={() => setOpen(false)}
            showCloseButton
            className="h-full max-h-[inherit] rounded-[inherit] border-0"
          />
        </motion.div>
      </AnimatePresence>
    ) : null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="ai-mentor-chat-panel"
        aria-label={
          chatEnabled
            ? open
              ? "Закрыть AI-наставника"
              : "Открыть AI-наставника"
            : "AI-наставник недоступен"
        }
        title={
          chatEnabled
            ? undefined
            : disabledReason
              ? getMentorDisabledCopy(disabledReason).title
              : MENTOR_UNAVAILABLE
        }
        data-mentor-open={open && chatEnabled ? "true" : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "ce-ai-mentor-fab ce-touch-target fixed z-[100] flex size-12 min-h-12 min-w-12 items-center justify-center rounded-full",
          "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]",
          "border border-border bg-card text-foreground shadow-md",
          "transition hover:bg-muted/80 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !chatEnabled && "opacity-60",
          open && chatEnabled && "ring-2 ring-ring/40 ring-offset-2 ring-offset-background",
          open && "max-lg:invisible max-lg:pointer-events-none",
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

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
