"use client";

import { BookOpen } from "lucide-react";
import { DashboardNextStepCard } from "@/components/dashboard/dashboard-next-step-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import type { DashboardNextStepCard as NextStep } from "@/lib/dashboard-ui";

export function DashboardNextLesson({ card }: { card: NextStep | null }) {
  if (!card) {
    return (
      <PremiumCard variant="default" padding="md" className="h-full min-w-0">
        <EmptyState
          compact
          title="Уроки появятся с курсом"
          description="Когда программа будет подключена, здесь отобразится следующая лекция."
        />
      </PremiumCard>
    );
  }

  return (
    <div className="h-full min-w-0" aria-labelledby="dash-next-lesson-heading">
      <p id="dash-next-lesson-heading" className="sr-only">
        Следующий урок
      </p>
      <DashboardNextStepCard card={card} sectionEyebrow="Следующий урок" sectionIcon={BookOpen} />
    </div>
  );
}
