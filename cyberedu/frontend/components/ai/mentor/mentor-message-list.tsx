"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot } from "lucide-react";
import { MentorCopyButton } from "@/components/ai/mentor/mentor-copy-button";
import { MentorLoadingState } from "@/components/ai/mentor/mentor-loading-state";
import { MentorMarkdown } from "@/components/ai/mentor/mentor-markdown";
import { MentorMessageMeta } from "@/components/ai/mentor/mentor-message-meta";
import { MentorSafetyRefusal } from "@/components/ai/mentor/mentor-safety-refusal";
import { isMentorSafetyRefusalTurn } from "@/lib/ai/mentor-ui/chat-state";
import { shouldShowStructuredRefusal } from "@/lib/ai/mentor-ui/refusal-ui";
import type { MentorChatTurn } from "@/lib/ai/mentor-ui/types";
import { formatRuDateTimeShortUtc } from "@/lib/datetime-stable";
import { cn } from "@/lib/utils";

export function MentorMessageList({
  messages,
  loading,
  streaming,
  topicLabel,
  onRefusalAction,
  layout = "default",
}: {
  messages: MentorChatTurn[];
  loading: boolean;
  streaming?: boolean;
  topicLabel?: string;
  onRefusalAction?: (prompt: string) => void;
  layout?: "default" | "page";
}) {
  const isPage = layout === "page";
  const reduce = useReducedMotion();

  return (
    <>
      {messages.map((m) => (
        <motion.article
          key={m.id}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className={cn(
            "ce-mentor-bubble min-w-0 overflow-x-clip rounded-xl border text-sm leading-relaxed",
            isPage ? "max-w-none px-4 py-3" : "max-w-full px-3 py-2.5",
            m.role === "user"
              ? isPage
                ? "ml-auto max-w-[min(100%,28rem)] border-cyan/30 bg-cyan/10"
                : "ml-3 border-cyan/30 bg-cyan/10 sm:ml-6"
              : "ce-mentor-bubble-assistant w-full",
            !isPage && m.role === "assistant" && "mr-0 sm:mr-1",
            m.role === "assistant" && isMentorSafetyRefusalTurn(m.meta) && "border-warning/30",
          )}
          aria-label={m.role === "user" ? "Ваше сообщение" : "Ответ AI-наставника"}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="min-w-0">
              {m.role === "assistant" ? (
                <p className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-cyan">
                  <Bot className="size-3" aria-hidden />
                  AI-наставник
                </p>
              ) : (
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Вы</p>
              )}
              {m.createdAt ? (
                <time
                  className="mt-0.5 block font-mono text-[10px] tabular-nums text-muted-foreground"
                  dateTime={m.createdAt}
                >
                  {formatRuDateTimeShortUtc(m.createdAt)}
                </time>
              ) : null}
            </div>
            {m.role === "assistant" ? <MentorCopyButton text={m.content} /> : null}
          </div>
          {m.role === "assistant" ? (
            <>
              {isMentorSafetyRefusalTurn(m.meta) ? (
                <MentorSafetyRefusal
                  meta={m.meta}
                  topicLabel={topicLabel}
                  onSuggestAction={onRefusalAction}
                  className="mb-2"
                />
              ) : null}
              {shouldShowStructuredRefusal(m.meta) ? null : (
                <MentorMarkdown source={m.content} prose />
              )}
              <MentorMessageMeta meta={m.meta} />
            </>
          ) : (
            <p className="overflow-wrap-anywhere whitespace-pre-wrap break-words text-foreground">
              {m.content}
            </p>
          )}
        </motion.article>
      ))}

      {loading ? <MentorLoadingState streaming={streaming} /> : null}
    </>
  );
}
