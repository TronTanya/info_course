"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markLessonStudiedAction, regenerateLessonAiAction, runLessonAiAction } from "@/lib/actions/lesson";
import type { LessonAiAction } from "@/lib/lesson-ai-meta";
import type { LearningPageContext } from "@/lib/learning-context";
import { extractLessonGoal, extractPracticeBlock, getLessonDifficultyLabel } from "@/lib/lesson-page-ui";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { LessonAsidePanel } from "@/components/lesson/lesson-aside-panel";
import { LessonGlossary } from "@/components/lesson/lesson-glossary";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import { LessonStickyCta } from "@/components/lesson/lesson-sticky-cta";
import { extractLessonGlossary, LessonStructuredText } from "@/components/lesson/lesson-structured-text";
import { InfoCard, NextLessonCard } from "@/components/lesson/lesson-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatRuDateTimeShortUtc } from "@/lib/datetime-stable";
import { cn } from "@/lib/utils";

export type LessonAiSnapshotClient = {
  id: string;
  adaptedContent: string;
  interestsUsed: string;
  createdAt: string;
} | null;

export type LessonPageClientProps = {
  moduleId: string;
  moduleOrderNumber: number;
  moduleTitle: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  learning: LearningPageContext;
  lesson: {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    allowAiAdaptation: boolean;
  };
  lessonCompleted: boolean;
  explanationAdaptation: LessonAiSnapshotClient;
  summaryAdaptation: LessonAiSnapshotClient;
};

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function LessonVideo({ url }: { url: string }) {
  const u = url.trim();
  if (!u) return null;
  const yt = extractYoutubeId(u);
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-card ring-1 ring-primary/15">
        <iframe
          title="Видео к лекции"
          className="size-full"
          src={`https://www.youtube.com/embed/${yt}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  return <video className="w-full rounded-2xl border border-border shadow-card" controls src={u} preload="metadata" />;
}

function Spinner() {
  return (
    <span
      className="inline-block size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
      aria-hidden
    />
  );
}

export function LessonPageClient({
  moduleId,
  moduleOrderNumber,
  moduleTitle,
  moduleProgressPercent,
  moduleStepsLabel,
  learning,
  lesson,
  lessonCompleted,
  explanationAdaptation,
  summaryAdaptation,
}: LessonPageClientProps) {
  const router = useRouter();
  const glossary = useMemo(() => extractLessonGlossary(lesson.content), [lesson.content]);
  const goal = useMemo(() => extractLessonGoal(lesson.content), [lesson.content]);
  const practice = useMemo(() => extractPracticeBlock(lesson.content), [lesson.content]);
  const difficulty = getLessonDifficultyLabel(moduleOrderNumber);

  const [contentTab, setContentTab] = useState<"lesson" | "ai" | "summary">("lesson");
  const [markPending, setMarkPending] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");

  const testHref = `/dashboard/course/${moduleId}/test`;
  const moduleHref = `/dashboard/course/${moduleId}`;

  async function runAi(action: LessonAiAction, question?: string) {
    setError(null);
    setAiBusy(true);
    try {
      const res = await runLessonAiAction({ moduleId, lessonId: lesson.id, action, question });
      if (res.error) {
        setError(res.error);
        return;
      }
      setContentTab(action === "summary" ? "summary" : "ai");
      router.refresh();
    } finally {
      setAiBusy(false);
    }
  }

  async function onRegenerate(kind: "explanation" | "summary") {
    setError(null);
    setAiBusy(true);
    try {
      const res = await regenerateLessonAiAction({ moduleId, lessonId: lesson.id, kind });
      if (res.error) {
        setError(res.error);
        return;
      }
      setContentTab(kind === "summary" ? "summary" : "ai");
      router.refresh();
    } finally {
      setAiBusy(false);
    }
  }

  async function onMarkStudied() {
    setError(null);
    setMarkPending(true);
    try {
      const res = await markLessonStudiedAction(moduleId);
      if (res.error) setError(res.error);
      else router.refresh();
    } finally {
      setMarkPending(false);
    }
  }

  const skipTypes = practice ? (["mini_case", "how"] as const) : [];

  const header = (
    <header className="space-y-3 border-b border-border/60 pb-5">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard/course" className="hover:text-primary">
          Трек
        </Link>
        <span aria-hidden>/</span>
        <Link href={moduleHref} className="hover:text-primary">
          Модуль {moduleOrderNumber}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Лекция</span>
      </nav>
      {moduleOrderNumber > 0 ? (
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          MOD-{String(moduleOrderNumber).padStart(2, "0")}
        </p>
      ) : null}
      <h1 className="typo-h1 max-w-prose text-balance text-2xl sm:text-3xl">{lesson.title}</h1>
      <div className="flex flex-wrap gap-2">
        <Badge variant={lessonCompleted ? "success" : "primary"}>
          {lessonCompleted ? "Изучено" : "Чтение"}
        </Badge>
        <Badge variant="outline">{difficulty}</Badge>
        <Badge variant="outline">{moduleTitle}</Badge>
      </div>
    </header>
  );

  return (
    <>
      <LessonLayout
        modules={learning.modules}
        steps={learning.steps}
        header={header}
        aside={
          <LessonAsidePanel
            moduleProgressPercent={moduleProgressPercent}
            moduleStepsLabel={moduleStepsLabel}
            lessonCompleted={lessonCompleted}
            difficulty={difficulty}
            steps={learning.steps}
            allowAiAdaptation={lesson.allowAiAdaptation}
            aiBusy={aiBusy}
            onRunAi={(a) => runAi(a)}
            onAskOpen={() => setAskOpen(true)}
            markPending={markPending}
            onMarkStudied={onMarkStudied}
          />
        }
        mobileCta={
          <LessonStickyCta
            lessonCompleted={lessonCompleted}
            markPending={markPending}
            onMarkStudied={onMarkStudied}
            testHref={testHref}
          />
        }
      >
        <div className="space-y-7">
        {error ? (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <InfoCard title="Цель урока" label="Задача" variant="info">
          <p>
            {goal ??
              "Изучите материал, закрепите термины и перейдите к тесту модуля. При необходимости используйте AI-наставника в боковой панели."}
          </p>
        </InfoCard>

        <div className="flex flex-wrap gap-2 border-b border-border/60 pb-2">
          {(
            [
              ["lesson", "Материал"],
              ["ai", "AI-объяснение"],
              ["summary", "Конспект"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setContentTab(key)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:px-3 sm:py-1.5",
                contentTab === key
                  ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-0">
          {aiBusy ? (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/85 backdrop-blur-sm"
              aria-busy="true"
            >
              <Spinner />
              <p className="text-sm font-medium text-foreground">AI обрабатывает запрос…</p>
            </div>
          ) : null}

          {contentTab === "lesson" ? (
            <div className="space-y-7">
              <LessonStructuredText source={lesson.content} skipTypes={[...skipTypes]} />
              {lesson.videoUrl ? (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Видео</h2>
                  <LessonVideo url={lesson.videoUrl} />
                </section>
              ) : null}
            </div>
          ) : null}

          {contentTab === "ai" ? (
            explanationAdaptation ? (
              <div className="mx-auto max-w-prose space-y-4">
                <LessonStructuredText source={explanationAdaptation.adaptedContent} />
                <p className="text-xs text-muted-foreground">{formatRuDateTimeShortUtc(explanationAdaptation.createdAt)}</p>
                {lesson.allowAiAdaptation ? (
                  <Button type="button" variant="outline" size="sm" disabled={aiBusy} onClick={() => onRegenerate("explanation")}>
                    Сгенерировать заново
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Запустите AI из панели «Прогресс и действия».</p>
            )
          ) : null}

          {contentTab === "summary" ? (
            summaryAdaptation ? (
              <div className="mx-auto max-w-prose space-y-4">
                <LessonStructuredText source={summaryAdaptation.adaptedContent} />
                <p className="text-xs text-muted-foreground">{formatRuDateTimeShortUtc(summaryAdaptation.createdAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Конспект появится после запроса «Конспект» в панели AI.</p>
            )
          ) : null}
        </div>

        <LessonGlossary terms={glossary} />

        {practice ? (
          <InfoCard title={practice.title} label="Практика" variant="success">
            <p className="whitespace-pre-wrap">{practice.body}</p>
          </InfoCard>
        ) : null}

        <NextLessonCard
          title="Контрольный тест модуля"
          description={
            lessonCompleted
              ? "Лекция отмечена как изученная — проверьте знания в тесте."
              : "После изучения материала отметьте лекцию и перейдите к тесту."
          }
          href={testHref}
          ctaLabel="Перейти к тесту"
          kind="test"
          className="hidden lg:block"
        />
        </div>
      </LessonLayout>

      <Modal
        open={askOpen}
        onOpenChange={setAskOpen}
        title="Вопрос наставнику"
        description="Кратко сформулируйте вопрос по материалу."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setAskOpen(false)}>
              Отмена
            </Button>
            <Button
              type="button"
              disabled={aiBusy}
              loading={aiBusy}
              onClick={async () => {
                const q = questionDraft.trim();
                if (!q) return;
                setAskOpen(false);
                await runAi("ask_assistant", q);
                setQuestionDraft("");
              }}
            >
              Отправить
            </Button>
          </>
        }
      >
        <Textarea
          value={questionDraft}
          onChange={(e) => setQuestionDraft(e.target.value)}
          placeholder="Например: как распознать фишинг в письме?"
          rows={5}
        />
      </Modal>

      <AiMentorChat moduleId={moduleId} lessonId={lesson.id} contextLabels={{ moduleTitle, lessonTitle: lesson.title }} />
    </>
  );
}
