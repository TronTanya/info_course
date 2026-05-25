"use client";

import { MENTOR_GUARDRAIL_NOTE } from "@/lib/ai/mentor-ui/chat-client";
import { cn } from "@/lib/utils";

export function MentorGuardrailNote({ className }: { className?: string }) {
  return (
    <p
      className={cn("text-[11px] leading-snug text-muted-foreground", className)}
      role="note"
    >
      {MENTOR_GUARDRAIL_NOTE}
    </p>
  );
}
