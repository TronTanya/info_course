"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  ClipboardCheck,
  FlaskConical,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useDashboardMentorChat } from "@/components/dashboard/dashboard-mentor-section";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildWeakTopicsRecommendationsView,
  hasWeakTopicsRecommendationsContent,
  type DashboardLearningRecommendation,
  type DashboardLearningRecommendationKind,
} from "@/lib/weak-topics-recommendations";
import type { WeakTopicPanelItem } from "@/lib/weak-topics-panel";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const WEAK_TOPIC_REPEAT_CTA = "Повторить";

const RECOMMENDATION_META: Record<
  DashboardLearningRecommendationKind,
  { icon: LucideIcon; cta: string }
> = {
  lesson: { icon: BookOpen, cta: "Повторить урок" },
  test: { icon: ClipboardCheck, cta: "Пройти тест" },
  practice: { icon: FlaskConical, cta: "Открыть практику" },
  ai: { icon: Bot, cta: "Спросить AI" },
};

function WeakTopicRow({ item }: { item: WeakTopicPanelItem }) {
  return (
    <li>
      <article
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4",
          "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className="flex min-w-0 gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-warning/35 bg-warning/10 text-warning"
            aria-hidden
          >
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                <span className="sr-only">Слабая тема: </span>
                {item.title}
              </h3>
              <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                {item.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-pretty leading-relaxed text-muted-foreground">{item.reason}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span>
                Связанный урок:{" "}
                <Link
                  href={item.lessonHref}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {item.lessonTitle}
                </Link>
              </span>
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="primary"
          size="sm"
          className="min-h-12 w-full shrink-0 touch-manipulation sm:min-h-10 sm:w-auto"
        >
          <Link href={item.href}>{WEAK_TOPIC_REPEAT_CTA}</Link>
        </Button>
      </article>
    </li>
  );
}

function RecommendationCard({
  item,
  onAskAi,
  aiDisabled,
}: {
  item: DashboardLearningRecommendation;
  onAskAi?: (prompt: string) => void;
  aiDisabled?: boolean;
}) {
  const meta = RECOMMENDATION_META[item.kind];
  const Icon = meta.icon;
  const isAi = item.kind === "ai";

  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            isAi ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-primary/25 bg-primary/10 text-primary",
          )}
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-pretty text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
      <span className="mt-3 inline-flex text-xs font-semibold text-primary">{meta.cta}</span>
    </>
  );

  const shellClass = cn(
    "flex h-full min-h-[9rem] flex-col justify-between rounded-xl border p-4 transition-colors",
    isAi
      ? "border-cyan/25 bg-cyan/5 hover:border-cyan/40"
      : "border-border/80 bg-muted/15 hover:border-primary/25 hover:bg-muted/25",
  );

  if (isAi) {
    if (onAskAi && item.mentorPrompt && !aiDisabled) {
      return (
        <li className="min-w-0">
          <button
            type="button"
            className={cn(
              shellClass,
              "w-full min-w-0 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            onClick={() => onAskAi(item.mentorPrompt!)}
          >
            {inner}
          </button>
        </li>
      );
    }
    return (
      <li className="min-w-0">
        <Link
          href={item.href ?? "/dashboard/mentor"}
          className={cn(
            shellClass,
            "block min-w-0",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          {inner}
        </Link>
      </li>
    );
  }

  if (!item.href) return null;

  return (
    <li className="min-w-0">
      <Link
        href={item.href}
        className={cn(
          shellClass,
          "block min-w-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {inner}
      </Link>
    </li>
  );
}

function WeakTopicsEmptyBlock({ firstTestHref }: { firstTestHref: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center sm:py-8">
      <span
        className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/25 text-muted-foreground"
        aria-hidden
      >
        <Sparkles className="size-6 opacity-70" />
      </span>
      <p className="max-w-md text-sm text-pretty text-muted-foreground">
        Рекомендации появятся после прохождения тестов.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {firstTestHref ? (
          <Button asChild variant="primary" size="sm" className="min-h-10 touch-manipulation">
            <Link href={firstTestHref}>Пройти первый тест</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm" className="min-h-10 touch-manipulation">
          <Link href="/dashboard/course">Открыть курс</Link>
        </Button>
      </div>
    </div>
  );
}

export type WeakTopicsRecommendationsProps = {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  aiConfigured?: boolean;
  onAskAi?: (prompt: string) => void;
  className?: string;
};

export function WeakTopicsRecommendations({
  stats,
  modules,
  aiConfigured = true,
  onAskAi: onAskAiProp,
  className,
}: WeakTopicsRecommendationsProps) {
  const { weakTopics, recommendations, firstTestHref } = buildWeakTopicsRecommendationsView(stats, modules);
  const { openChat } = useDashboardMentorChat();
  const onAskAi = onAskAiProp ?? openChat;

  const actionRecs = recommendations.filter((r) => r.kind !== "ai");
  const aiRec = recommendations.find((r) => r.kind === "ai");
  const hasContent = hasWeakTopicsRecommendationsContent(weakTopics, recommendations);

  if (!hasContent) {
    return (
      <PremiumCard variant="default" padding="md" className={cn("min-w-0", className)}>
        <p className="typo-eyebrow text-primary">Слабые темы и рекомендации</p>
        <WeakTopicsEmptyBlock firstTestHref={firstTestHref} />
      </PremiumCard>
    );
  }

  return (
    <PremiumCard
      variant="glow"
      padding="md"
      className={cn("relative min-w-0 overflow-hidden", className)}
      aria-labelledby="weak-topics-recommendations-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-1">
        <p id="weak-topics-recommendations-heading" className="typo-eyebrow text-primary">
          Слабые темы и рекомендации
        </p>
        <p className="text-xs text-pretty text-muted-foreground">
          Только зафиксированные результаты тестов и практик — без ответов и скрытых критериев.
        </p>
      </div>

      {weakTopics.length > 0 ? (
        <section className="relative mt-5" aria-labelledby="weak-topics-list-heading">
          <h2 id="weak-topics-list-heading" className="text-sm font-semibold text-foreground">
            Слабые темы
          </h2>
          <ul className="mt-3 space-y-3">
            {weakTopics.map((item) => (
              <WeakTopicRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}

      {actionRecs.length > 0 || aiRec ? (
        <section
          className={cn("relative", weakTopics.length > 0 && "mt-6 border-t border-border/70 pt-6")}
          aria-labelledby="learning-recommendations-heading"
        >
          <h2 id="learning-recommendations-heading" className="text-sm font-semibold text-foreground">
            Рекомендации
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {actionRecs.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
            {aiRec ? (
              <RecommendationCard
                key={aiRec.id}
                item={aiRec}
                onAskAi={onAskAi}
                aiDisabled={!aiConfigured}
              />
            ) : null}
          </ul>
        </section>
      ) : null}
    </PremiumCard>
  );
}

/** @deprecated Используйте `WeakTopicsRecommendations`. */
export const WeakTopicsRecommendationsPanel = WeakTopicsRecommendations;
