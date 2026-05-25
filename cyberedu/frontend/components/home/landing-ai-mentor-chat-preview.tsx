import { Bot, ShieldCheck, User } from "lucide-react";
import { LANDING_MENTOR_CHAT_PREVIEW } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export function LandingAiMentorChatPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "ce-landing-mentor-chat ce-landing-glass-tile overflow-hidden rounded-2xl border shadow-card",
        className,
      )}
      aria-label="Пример диалога с AI-наставником"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-primary/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan">
            <Bot className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">AI-наставник</p>
            <p className="text-[10px] text-muted-foreground">Учебный режим · демо</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
          <ShieldCheck className="size-3" aria-hidden />
          safe
        </span>
      </div>

      <div className="space-y-3 bg-[color-mix(in_oklab,var(--background)_40%,transparent)] p-4 sm:p-5">
        <article className="ce-mentor-bubble ml-4 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm">
          <p className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <User className="size-3" aria-hidden />
            Вы
          </p>
          <p className="text-pretty leading-relaxed text-foreground">{LANDING_MENTOR_CHAT_PREVIEW.user}</p>
        </article>

        <article className="ce-mentor-bubble ce-mentor-bubble-assistant mr-1 rounded-xl border px-3 py-2.5 text-sm">
          <p className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <Bot className="size-3 text-cyan" aria-hidden />
            Наставник
          </p>
          <p className="text-pretty leading-relaxed text-foreground">{LANDING_MENTOR_CHAT_PREVIEW.assistant}</p>
        </article>

        <p className="border-t border-border/60 pt-3 text-center text-[10px] leading-relaxed text-subtle-foreground">
          Превью для маркетинга · без ключей заданий и флагов
        </p>
      </div>
    </div>
  );
}
