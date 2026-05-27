import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LessonReadingProgressBar } from "@/components/lesson/lesson-reading-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type LessonHeaderProps = {
  moduleOrderNumber: number;
  moduleTitle: string;
  moduleHref: string;
  lessonTitle: string;
  description: string | null;
  lessonCompleted: boolean;
  difficulty: string;
  readingPercent: number;
  onAskMentor?: () => void;
};

export function LessonHeader({
  moduleOrderNumber,
  moduleTitle,
  moduleHref,
  lessonTitle,
  description,
  lessonCompleted,
  difficulty,
  readingPercent,
  onAskMentor,
}: LessonHeaderProps) {
  return (
    <header className="ce-learn-os-panel ce-learn-os-panel--glow space-y-4 rounded-2xl! border-0 p-4 sm:p-5">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Навигация">
        <Link href="/dashboard/course" className="font-mono text-2.5 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          Карта курса
        </Link>
        <span aria-hidden>/</span>
        <Link href={moduleHref} className="hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          Модуль {moduleOrderNumber}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Лекция</span>
      </nav>

      {moduleOrderNumber > 0 ? (
        <p className="font-mono text-2.5 font-bold uppercase tracking-eyebrow text-primary">
          MOD-{String(moduleOrderNumber).padStart(2, "0")}
        </p>
      ) : null}

      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-balance text-foreground sm:text-3xl lg:text-4xl lg:max-w-3xl">
          {lessonTitle}
        </h1>
        {description ? (
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={lessonCompleted ? "success" : "primary"}>{lessonCompleted ? "Изучено" : "Чтение"}</Badge>
        <Badge variant="outline">{difficulty}</Badge>
        <Badge variant="outline" className="max-w-56 truncate">
          {moduleTitle}
        </Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <LessonReadingProgressBar percent={readingPercent} lessonCompleted={lessonCompleted} className="max-w-xl flex-1" />
        {onAskMentor ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden shrink-0 gap-2 border-cyan/30 sm:inline-flex lg:size-default"
            onClick={onAskMentor}
          >
            <Sparkles className="size-4 text-cyan" aria-hidden />
            Спросить AI по этому уроку
          </Button>
        ) : null}
      </div>
    </header>
  );
}
