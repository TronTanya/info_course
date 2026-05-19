import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function CourseEmpty() {
  return (
    <EmptyState
      terminalLine="course --unavailable"
      title="Курс ещё не добавлен"
      description="Когда администратор настроит программу, здесь появится траектория модулей и прогресс."
      icon={<BookOpen className="size-7 opacity-70" aria-hidden />}
      action={
        <Button asChild variant="outline">
          <Link href="/dashboard">В кабинет</Link>
        </Button>
      }
    />
  );
}
