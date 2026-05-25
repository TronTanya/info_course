"use client";

import { KeyRound, Lock, LogIn, PowerOff } from "lucide-react";
import {
  getMentorDisabledCopy,
  type MentorDisabledReason,
} from "@/lib/ai/mentor-ui/chat-state";
import { cn } from "@/lib/utils";

const ICONS = {
  env_off: PowerOff,
  no_api_key: KeyRound,
  unauthorized: LogIn,
  content_locked: Lock,
} as const;

export function MentorDisabledState({
  reason = "no_api_key",
  hint,
  className,
}: {
  reason?: MentorDisabledReason;
  hint?: string | null;
  className?: string;
}) {
  const copy = getMentorDisabledCopy(reason, hint);
  const Icon = ICONS[reason];

  return (
    <div
      className={cn(
        "ce-mentor-disabled rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-4 text-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {copy.title}
      </p>
      <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">{copy.description}</p>
    </div>
  );
}
