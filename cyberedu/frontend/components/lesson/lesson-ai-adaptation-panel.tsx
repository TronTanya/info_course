import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function LessonAiAdaptationPanel({
  children,
  className,
  label = "AI-материал",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "ce-lesson-ai-block w-full max-w-none rounded-xl border border-border/80 bg-card/80 px-4 py-5 shadow-sm sm:px-6 sm:py-6",
        className,
      )}
    >
      <p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5 text-primary/80" aria-hidden />
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
