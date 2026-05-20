"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MentorErrorBanner({
  message,
  onRetry,
  disabled,
}: {
  message: string;
  onRetry?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2.5" role="alert">
      <p className="text-xs leading-relaxed text-danger">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 h-8 gap-1.5 border-danger/30 text-danger hover:bg-danger/10"
          disabled={disabled}
          onClick={onRetry}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Повторить
        </Button>
      ) : null}
    </div>
  );
}
