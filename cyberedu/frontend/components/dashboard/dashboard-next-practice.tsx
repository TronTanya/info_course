"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { DashboardNextStepCard } from "@/components/dashboard/dashboard-next-step-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import type { DashboardNextStepCard as NextStep } from "@/lib/dashboard-ui";

export function DashboardNextPractice({ card }: { card: NextStep | null }) {
  if (!card) {
    return (
      <PremiumCard variant="default" padding="md" className="h-full min-w-0">
        <EmptyState
          compact
          title="Практика пока недоступна"
          description="Откройте карту курса — лаборатория появится после лекции и теста в модуле."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/course">Карта курса</Link>
            </Button>
          }
        />
      </PremiumCard>
    );
  }

  return (
    <div className="h-full min-w-0" aria-labelledby="dash-next-practice-heading">
      <p id="dash-next-practice-heading" className="sr-only">
        Следующая практика
      </p>
      <DashboardNextStepCard card={card} sectionEyebrow="Следующая практика" sectionIcon={FlaskConical} />
    </div>
  );
}
