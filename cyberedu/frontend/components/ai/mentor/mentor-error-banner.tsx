"use client";

import { AlertCircle, Clock, CloudOff, LogIn, RotateCcw, ShieldAlert, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MENTOR_COMPOSER_ERROR_ID } from "@/lib/ai/mentor-ui/mentor-a11y";
import type { MentorErrorKind } from "@/lib/ai/mentor-ui/chat-state";
import { cn } from "@/lib/utils";

export type { MentorErrorKind };

const TITLES: Record<MentorErrorKind, string> = {
  network: "Нет связи с сервером",
  server: "Сервис наставника недоступен",
  rate_limit: "Слишком много запросов",
  config: "AI-наставник недоступен",
  unauthorized: "Нужен вход в аккаунт",
  moderation: "Ответ не прошёл проверку",
  provider: "AI временно недоступен",
  generic: "Не удалось отправить",
};

const ICONS: Record<MentorErrorKind, typeof AlertCircle> = {
  network: WifiOff,
  server: CloudOff,
  rate_limit: Clock,
  config: CloudOff,
  unauthorized: LogIn,
  moderation: ShieldAlert,
  provider: CloudOff,
  generic: AlertCircle,
};

export function MentorErrorBanner({
  message,
  kind = "generic",
  onRetry,
  disabled,
  id = MENTOR_COMPOSER_ERROR_ID,
  linkToComposer = true,
}: {
  message: string;
  kind?: MentorErrorKind;
  onRetry?: () => void;
  disabled?: boolean;
  id?: string;
  /** Связать с полем ввода через aria-describedby. */
  linkToComposer?: boolean;
}) {
  const Icon = ICONS[kind];
  const showRetry = onRetry && kind !== "unauthorized" && kind !== "rate_limit";

  return (
    <div
      id={linkToComposer ? id : undefined}
      className="ce-mentor-error rounded-lg border border-danger/35 bg-danger/10 px-3 py-2.5"
      role="alert"
    >
      <p className="flex items-center gap-2 text-xs font-semibold text-danger">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {TITLES[kind]}
      </p>
      <p className={cn("mt-1 text-xs leading-relaxed text-danger/90")}>{message}</p>
      {showRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 h-8 gap-1.5 border-danger/30 text-danger hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-danger/50"
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
