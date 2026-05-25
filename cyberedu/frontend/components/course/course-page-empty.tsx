import Link from "next/link";
import { Layers, Rocket } from "lucide-react";
import type { CourseNextStep } from "@/lib/course-next-step";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function CourseNoModulesEmpty() {
  return (
    <EmptyState
      terminalLine="roadmap --modules 0"
      title="Модули ещё не настроены"
      description="Администратор добавит модули в программу — тогда здесь появится карта обучения и прогресс."
      icon={<Layers className="size-7 opacity-70" aria-hidden />}
    />
  );
}

export function CourseNotStartedEmpty({ step }: { step: CourseNextStep }) {
  return (
    <EmptyState
      terminalLine="progress --init"
      title="Вы ещё не начали обучение"
      description="Откройте первый модуль и пройдите вводную лекцию — после этого откроются тест и практика по цепочке."
      icon={<Rocket className="size-7 opacity-70" aria-hidden />}
      action={
        <Button asChild variant="primary" size="lg">
          <Link href={step.href}>{step.ctaLabel}</Link>
        </Button>
      }
    />
  );
}
