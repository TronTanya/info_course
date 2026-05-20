"use client";

import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import { openMentorChat } from "@/lib/ai/mentor-ui/open";
import type { DashboardAiRecommendation } from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";

export function DashboardAiRecommendation({ recommendation }: { recommendation: DashboardAiRecommendation }) {
  return (
    <PremiumCard
      variant="accent"
      padding="md"
      className="flex h-full min-w-0 flex-col border-cyan/20"
      aria-labelledby="dash-ai-heading"
    >
      <div className="flex gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p id="dash-ai-heading" className="typo-eyebrow text-cyan">
            AI recommendation
          </p>
          <p className="mt-2 break-words text-sm leading-relaxed text-pretty text-foreground">
            {recommendation.message}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          className="w-full border-cyan/30 text-cyan hover:bg-cyan/10 sm:w-auto"
          onClick={() => openMentorChat()}
        >
          <MessageSquare className="size-4" aria-hidden />
          {recommendation.actionLabel}
        </Button>
        <Button asChild variant="ghost" size="md" className="w-full sm:w-auto">
          <Link href={recommendation.mentorHref}>К материалам модуля</Link>
        </Button>
      </div>
    </PremiumCard>
  );
}
