"use client";

import { ClipboardCheck } from "lucide-react";
import { DashboardNextStepCard } from "@/components/dashboard/dashboard-next-step-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import type { DashboardNextStepCard as NextStep } from "@/lib/dashboard-ui";

export function DashboardNextTest({ card }: { card: NextStep | null }) {
  if (!card) {
    return (
      <PremiumCard variant="default" padding="md" className="h-full min-w-0">
        <EmptyState
          compact
          title="Тесты появятся с курсом"
          description="После лекции в модуле здесь будет ссылка на контрольный тест."
        />
      </PremiumCard>
    );
  }

  return (
    <div className="h-full min-w-0" aria-labelledby="dash-next-test-heading">
      <p id="dash-next-test-heading" className="sr-only">
        Следующий тест
      </p>
      <DashboardNextStepCard card={card} sectionEyebrow="Следующий тест" sectionIcon={ClipboardCheck} />
    </div>
  );
}
