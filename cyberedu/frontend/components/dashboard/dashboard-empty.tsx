import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function DashboardEmpty() {
  return (
    <EmptyState
      title="Курс пока не подключён"
      description="Администратор ещё не опубликовал программу. Обновите страницу позже или вернитесь на главную — мы уведомим, когда курс будет доступен."
      icon={<BookOpen className="size-7 opacity-70" aria-hidden />}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="primary">
            <Link href="/dashboard/settings">Настройки профиля</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">На главную</Link>
          </Button>
        </div>
      }
    />
  );
}
