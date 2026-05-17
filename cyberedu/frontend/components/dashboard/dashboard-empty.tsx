import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function DashboardEmpty() {
  return (
    <EmptyState
      title="Курс пока не подключён"
      description="Администратор ещё не настроил программу в системе. Когда курс появится, здесь отобразятся прогресс и следующие шаги."
      icon={<BookOpen className="size-7 opacity-70" aria-hidden />}
      action={
        <Button asChild variant="outline">
          <Link href="/">На главную</Link>
        </Button>
      }
    />
  );
}
