"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MENTOR_MAX_PROMPT_LENGTH } from "@/lib/ai/mentor-ui/chat-client";
import {
  MENTOR_COMPOSER_INPUT_ID,
  mentorComposerDescribedBy,
} from "@/lib/ai/mentor-ui/mentor-a11y";
import type { AIMentorMode } from "@/types/ai-mentor";
import { cn } from "@/lib/utils";

export function MentorComposer({
  draft,
  onDraftChange,
  onSubmit,
  disabled,
  loading,
  chatEnabled,
  draftLen,
  draftOverLimit,
  inputRef,
  selectedModeId = null,
  hasComposerError = false,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  chatEnabled: boolean;
  draftLen: number;
  draftOverLimit: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  selectedModeId?: AIMentorMode | null;
  hasComposerError?: boolean;
}) {
  const inputDisabled = disabled || !chatEnabled || loading;
  const canSend = chatEnabled && !disabled && !loading && draft.trim().length > 0 && !draftOverLimit;
  const modeActive = Boolean(selectedModeId);

  return (
    <div className="ce-mentor-footer ce-mentor-footer--composer shrink-0 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Textarea
        ref={inputRef}
        id={MENTOR_COMPOSER_INPUT_ID}
        aria-invalid={draftOverLimit || hasComposerError || undefined}
        aria-describedby={mentorComposerDescribedBy({
          draftOverLimit,
          hasError: hasComposerError,
          modeActive,
        })}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        maxLength={MENTOR_MAX_PROMPT_LENGTH + 200}
        placeholder={
          chatEnabled
            ? "Вопрос по материалу…"
            : "Наставник недоступен."
        }
        rows={2}
        className={cn(
          "ce-mentor-input min-h-[56px] resize-none text-sm shadow-none",
          (draftOverLimit || hasComposerError) && "border-danger",
        )}
        disabled={inputDisabled}
        aria-busy={loading || undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSend) onSubmit();
          }
        }}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p
          id="mentor-draft-hint"
          className={cn(
            "font-mono text-[10px] tabular-nums",
            draftOverLimit ? "text-danger" : "text-muted-foreground",
          )}
        >
          {draftOverLimit ? (
            <span id="mentor-draft-limit-hint">Превышен лимит {MENTOR_MAX_PROMPT_LENGTH} символов</span>
          ) : (
            <>
              {draftLen} / {MENTOR_MAX_PROMPT_LENGTH}
            </>
          )}
        </p>
        <Button
          type="button"
          size="md"
          variant="primary"
          loading={loading}
          disabled={!canSend || loading}
          aria-disabled={!canSend || loading}
          aria-label={loading ? "Отправка" : "Отправить"}
          className="ce-mentor-send ce-touch-target min-w-[7.5rem] shrink-0 shadow-sm"
          onClick={onSubmit}
        >
          Отправить
        </Button>
      </div>
    </div>
  );
}
