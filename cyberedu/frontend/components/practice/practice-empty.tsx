import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function PracticeEmpty({ moduleId }: { moduleId: string }) {
  return (
    <EmptyState
      terminalLine="lab --no-tasks"
      title="Практических заданий пока нет"
      description="Администратор ещё не опубликовал лабораторные сценарии для этого модуля. Вернитесь к карте курса или повторите лекцию и тест."
      icon={<FlaskConical className="size-7 opacity-80 text-primary" aria-hidden />}
      action={
        <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
          <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
        </Button>
      }
    />
  );
}
