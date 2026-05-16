"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markLessonStudiedAction, regenerateLessonAiAction, runLessonAiAction } from "@/lib/actions/lesson";
import { lessonAiActionLabel, parseLessonAiMeta, type LessonAiAction } from "@/lib/lesson-ai-meta";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { extractLessonGlossary, LessonStructuredText } from "@/components/lesson/lesson-structured-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatRuDateTimeShortUtc } from "@/lib/datetime-stable";

export type LessonAiSnapshotClient = {
  id: string;
  adaptedContent: string;
  interestsUsed: string;
  createdAt: string;
} | null;

export type LessonPageClientProps = {
  moduleId: string;
  moduleTitle: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
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
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || null;
      }
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
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/80 bg-black shadow-[0_8px_30px_-10px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/10">
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
  return <video className="w-full rounded-xl border border-border shadow-sm" controls src={u} preload="metadata" />;
}

const AI_BUTTONS: { action: LessonAiAction; label: string }[] = [
  { action: "simpler", label: "Объяснить проще" },
  { action: "adapt_interests", label: "Объяснить через мои интересы" },
  { action: "example", label: "Привести пример" },
  { action: "summary", label: "Сделать краткий конспект" },
];

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("size-8 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent", className)}
      aria-hidden
    />
  );
}

function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3v1M12 20v1M3 12h1M20 12h1" strokeLinecap="round" />
      <path
        d="m15 9-1.5 4.5L9 15l4.5 1.5L15 21l1.5-4.5L21 15l-4.5-1.5L15 9Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AiResultMeta({ interestsUsed }: { interestsUsed: string }) {
  const meta = parseLessonAiMeta(interestsUsed);
  if (!meta) return null;
  const label = lessonAiActionLabel(meta.action);
  const interests =
    meta.interestsSnapshot && meta.interestsSnapshot !== "—" ? meta.interestsSnapshot.trim() : null;
  const specialty =
    meta.specialtySnapshot && meta.specialtySnapshot.trim() && meta.specialtySnapshot.trim() !== "—"
      ? meta.specialtySnapshot.trim()
      : null;
  const q = meta.question?.trim();
  return (
    <div className="space-y-2 rounded-xl border-l-4 border-l-cyan/70 bg-linear-to-r from-cyan/[0.06] to-muted/25 px-4 py-3 text-sm shadow-sm ring-1 ring-inset ring-border/50">
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Режим:</span> {label}
      </p>
      {interests ? (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Интересы при генерации:</span> {interests}
        </p>
      ) : null}
      {specialty ? (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Специальность (контекст):</span> {specialty}
        </p>
      ) : null}
      {q ? (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Вопрос:</span> {q}
        </p>
      ) : null}
    </div>
  );
}

export function LessonPageClient({
  moduleId,
  moduleTitle,
  moduleProgressPercent,
  moduleStepsLabel,
  lesson,
  lessonCompleted,
  explanationAdaptation,
  summaryAdaptation,
}: LessonPageClientProps) {
  const router = useRouter();
  const glossary = useMemo(() => extractLessonGlossary(lesson.content), [lesson.content]);
  const [mainTab, setMainTab] = useState<"original" | "ai" | "summary">("original");
  const [markPending, setMarkPending] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiAction, setAiAction] = useState<LessonAiAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");

  function loadingHint(): string {
    if (aiAction === "adapt_interests") {
      return "AI адаптирует объяснение под ваши интересы…";
    }
    return "Генерируем ответ…";
  }

  async function runAi(action: LessonAiAction, question?: string) {
    setError(null);
    setAiBusy(true);
    setAiAction(action);
    try {
      const res = await runLessonAiAction({
        moduleId,
        lessonId: lesson.id,
        action,
        question,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setMainTab(action === "summary" ? "summary" : "ai");
      router.refresh();
    } finally {
      setAiBusy(false);
      setAiAction(null);
    }
  }

  async function onRegenerate(kind: "explanation" | "summary") {
    setError(null);
    const meta =
      kind === "summary"
        ? parseLessonAiMeta(summaryAdaptation?.interestsUsed ?? null)
        : parseLessonAiMeta(explanationAdaptation?.interestsUsed ?? null);
    setAiBusy(true);
    setAiAction(meta?.action ?? "simpler");
    try {
      const res = await regenerateLessonAiAction({ moduleId, lessonId: lesson.id, kind });
      if (res.error) {
        setError(res.error);
        return;
      }
      setMainTab(kind === "summary" ? "summary" : "ai");
      router.refresh();
    } finally {
      setAiBusy(false);
      setAiAction(null);
    }
  }

  async function onMarkStudied() {
    setError(null);
    setMarkPending(true);
    try {
      const res = await markLessonStudiedAction(moduleId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    } finally {
      setMarkPending(false);
    }
  }

  const testHref = `/dashboard/course/${moduleId}/test`;
  const moduleHref = `/dashboard/course/${moduleId}`;

  return (
    <>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-card ring-1 ring-secondary/10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
            <Button variant="outline" size="sm" className="shrink-0 self-start" asChild>
              <Link href={moduleHref} aria-label="Назад к модулю">
                ← Назад
              </Link>
            </Button>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Модуль</p>
              <p className="truncate text-sm font-semibold text-foreground sm:text-base">{moduleTitle}</p>
              <p className="text-xs text-muted-foreground">Лекция</p>
              <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{lesson.title}</h1>
            </div>
          </div>
          <div className="w-full shrink-0 space-y-2 sm:max-w-[220px]">
            <div className="flex items-end justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Прогресс модуля</p>
              <span className="text-sm font-semibold tabular-nums text-foreground">{moduleProgressPercent}%</span>
            </div>
            <ProgressBar value={moduleProgressPercent} max={100} label={`Шаги: ${moduleStepsLabel}`} />
          </div>
        </header>

        {error ? (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
        ) : null}

        <div className="lesson-layout">
          <div className="relative min-w-0">
            {aiBusy ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-primary/30 bg-background/85 px-6 py-16 text-center backdrop-blur-sm"
                aria-busy="true"
                aria-live="polite"
              >
                <Spinner />
                <p className="max-w-sm text-pretty text-sm font-medium text-foreground">{loadingHint()}</p>
              </div>
            ) : null}

            <div className="lesson-prose w-full space-y-3">
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Оригинальный текст в базе не меняется — отдельные вкладки для AI-объяснения и конспекта.
              </p>

              <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)} className="w-full">
                <TabsList className="flex h-auto w-full min-h-11 snap-x snap-mandatory gap-1 overflow-x-auto overflow-y-hidden border border-border/60 bg-linear-to-b from-secondary/8 to-muted/50 p-1.5 text-[11px] leading-tight shadow-inner ring-1 ring-inset ring-secondary/10 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:grid sm:grid-cols-3 sm:overflow-x-visible sm:snap-none sm:text-sm">
                  <TabsTrigger value="original" className="min-w-[7.5rem] shrink-0 snap-start sm:min-w-0">
                    Оригинал
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="min-w-[7.5rem] shrink-0 snap-start sm:min-w-0">
                    AI-объяснение
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="min-w-[7.5rem] shrink-0 snap-start sm:min-w-0">
                    Конспект
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="original"
                  className="mt-4 space-y-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm ring-1 ring-inset ring-border/40 sm:p-6"
                >
                  <LessonStructuredText source={lesson.content} />
                  {lesson.videoUrl ? (
                    <div className="space-y-2 border-t border-border pt-6">
                      <h3 className="text-sm font-semibold text-foreground">Видео к лекции</h3>
                      <LessonVideo url={lesson.videoUrl} />
                    </div>
                  ) : null}
                </TabsContent>

                <TabsContent
                  value="ai"
                  className="mt-4 space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm ring-1 ring-inset ring-border/40 sm:p-6"
                >
                  {explanationAdaptation ? (
                    <>
                      <AiResultMeta interestsUsed={explanationAdaptation.interestsUsed} />
                      <div className="rounded-2xl border border-primary/15 bg-linear-to-br from-primary/[0.04] to-card p-4 ring-1 ring-inset ring-primary/10 sm:p-5">
                        <LessonStructuredText source={explanationAdaptation.adaptedContent} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRuDateTimeShortUtc(explanationAdaptation.createdAt)}
                      </p>
                      {lesson.allowAiAdaptation ? (
                        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={aiBusy}
                            onClick={() => onRegenerate("explanation")}
                          >
                            Сгенерировать заново
                          </Button>
                          <Button type="button" variant="ghost" size="sm" disabled={aiBusy} onClick={() => setMainTab("original")}>
                            Вернуться к оригиналу
                          </Button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-pretty text-sm text-muted-foreground">
                      Здесь появится AI-объяснение после нажатия одной из кнопок в панели справа. Исходник лекции в базе не меняется.
                    </p>
                  )}
                </TabsContent>

                <TabsContent
                  value="summary"
                  className="mt-4 space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm ring-1 ring-inset ring-border/40 sm:p-6"
                >
                  {summaryAdaptation ? (
                    <>
                      <AiResultMeta interestsUsed={summaryAdaptation.interestsUsed} />
                      <div className="rounded-2xl border border-primary/15 bg-linear-to-br from-primary/[0.04] to-card p-4 ring-1 ring-inset ring-primary/10 sm:p-5">
                        <LessonStructuredText source={summaryAdaptation.adaptedContent} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRuDateTimeShortUtc(summaryAdaptation.createdAt)}
                      </p>
                      {lesson.allowAiAdaptation ? (
                        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={aiBusy}
                            onClick={() => onRegenerate("summary")}
                          >
                            Сгенерировать заново
                          </Button>
                          <Button type="button" variant="ghost" size="sm" disabled={aiBusy} onClick={() => setMainTab("original")}>
                            Вернуться к оригиналу
                          </Button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="space-y-3 text-pretty text-sm text-muted-foreground">
                      <p>Конспект ещё не создан. Нажмите «Сделать краткий конспект» в панели AI справа.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="overflow-hidden border-primary/25 bg-linear-to-br from-primary/[0.06] via-card to-cyan/[0.05] shadow-card ring-1 ring-secondary/10">
              <CardHeader className="space-y-2 border-b border-border/50 bg-secondary/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                    <IconSparkles className="size-5" />
                  </span>
                  <div>
                    <CardTitle className="typo-h3">AI</CardTitle>
                    <CardDescription className="typo-caption leading-relaxed">
                      Объяснения и конспект не перезаписывают исходник лекции.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {lesson.allowAiAdaptation ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 max-xl:grid-cols-2">
                      {AI_BUTTONS.map((b) => (
                        <Button
                          key={b.action}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-auto min-h-11 justify-center border-primary/20 bg-card/80 px-2 py-2.5 text-center text-[11px] leading-snug shadow-sm hover:border-primary/40 hover:bg-primary/[0.04] sm:min-h-10 sm:px-3 sm:text-xs"
                          disabled={aiBusy}
                          onClick={() => runAi(b.action)}
                        >
                          {b.label}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={aiBusy}
                      onClick={() => setAskOpen(true)}
                    >
                      Задать вопрос AI-ассистенту
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Для этой лекции отключены AI-функции.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm ring-1 ring-inset ring-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Словарь терминов</CardTitle>
                <CardDescription className="text-xs">Из блоков :::definition и :::terms в тексте лекции.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[min(40vh,320px)] space-y-3 overflow-y-auto pr-1 text-sm">
                {glossary.length ? (
                  glossary.map((g) => (
                    <div key={g.term} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                      <p className="font-semibold leading-snug text-foreground">{g.term}</p>
                      {g.description ? (
                        <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">{g.description}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                    Пока пусто. Добавьте в материал лекции блоки <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">:::definition</code> или{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">:::terms</code>.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm ring-1 ring-inset ring-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Текущий прогресс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Модуль</span>
                  <span className="text-sm font-semibold tabular-nums">{moduleProgressPercent}%</span>
                </div>
                <ProgressBar value={moduleProgressPercent} max={100} label={`Шаги: ${moduleStepsLabel}`} />
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/[0.03] shadow-sm ring-1 ring-inset ring-primary/15">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Следующий шаг</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lessonCompleted ? (
                  <>
                    <p className="text-pretty text-muted-foreground">Лекция изучена. Можно переходить к проверке знаний.</p>
                    <Button variant="primary" size="sm" className="w-full" asChild>
                      <Link href={testHref}>Перейти к тесту</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-pretty text-muted-foreground">Отметьте лекцию как изученную, чтобы открыть тест по модулю.</p>
                    <Button type="button" variant="outline" size="sm" className="w-full" loading={markPending} disabled={markPending} onClick={onMarkStudied}>
                      Отметить как изученную
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>

        <Card className="overflow-hidden border-border/80 bg-linear-to-r from-card via-muted/20 to-card shadow-card ring-1 ring-inset ring-white/50">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="lesson-prose flex max-w-none flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                loading={markPending}
                disabled={lessonCompleted || markPending}
                onClick={onMarkStudied}
              >
                Отметить лекцию как изученную
              </Button>
              {lessonCompleted ? (
                <Badge variant="success" className="w-fit">
                  Лекция изучена
                </Badge>
              ) : (
                <span className="text-pretty text-xs text-muted-foreground">После изучения откроется доступ к тесту.</span>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {lessonCompleted ? (
                <Button variant="primary" className="w-full sm:w-auto" asChild>
                  <Link href={testHref}>Перейти к тесту</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full sm:w-auto" disabled title="Сначала отметьте лекцию как изученную">
                  Перейти к тесту
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={askOpen}
        onOpenChange={setAskOpen}
        title="Вопрос AI-ассистенту"
        description="Кратко сформулируйте вопрос по материалу лекции."
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
          placeholder="Например: как это применить в повседневной жизни?"
          rows={5}
          className="min-h-[120px]"
        />
      </Modal>

      <div className="mt-10 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-inner ring-1 ring-secondary/5 sm:p-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Наставник</p>
        <AiMentorChat moduleId={moduleId} lessonId={lesson.id} />
      </div>
    </>
  );
}
