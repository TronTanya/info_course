import Link from "next/link";
import { BookX, LogIn } from "lucide-react";
import type { CoursePageLoadErrorKind } from "@/lib/course-page-load";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { CoursePageRetryButton } from "@/components/course/course-page-retry-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";

const ERROR_COPY: Record<
  CoursePageLoadErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  progress: {
    terminalLine: "progress --sync failed",
    title: "Не удалось загрузить прогресс",
    description:
      "Данные о прохождении временно недоступны. Обновите страницу или вернитесь в кабинет и откройте курс снова.",
  },
  modules: {
    terminalLine: "course --modules failed",
    title: "Не удалось загрузить модули",
    description:
      "Программа курса не загрузилась. Повторите попытку позже или обратитесь в поддержку, если ошибка сохраняется.",
  },
};

function ErrorActions() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <CoursePageRetryButton />
      <Button asChild variant="outline">
        <Link href="/dashboard">Вернуться в кабинет</Link>
      </Button>
    </div>
  );
}

export function CoursePageLoadError({ kind }: { kind: CoursePageLoadErrorKind }) {
  const copy = ERROR_COPY[kind];
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
      <ErrorCard
        className="max-w-lg w-full"
        server
        title={copy.title}
        description={copy.description}
        action={<ErrorActions />}
      />
    </div>
  );
}

export function CourseNotFoundEmpty() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
      <EmptyState
        terminalLine="course --not-found"
        title="Курс не найден"
        description="Программа обучения не настроена или временно недоступна. Вернитесь в кабинет — когда курс появится, карта модулей откроется автоматически."
        icon={<BookX className="size-7 opacity-70" aria-hidden />}
        action={
          <Button asChild variant="primary">
            <Link href="/dashboard">Вернуться в кабинет</Link>
          </Button>
        }
      />
    </div>
  );
}

export function CourseUnauthorizedState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
      <EmptyState
        terminalLine="auth --required"
        title="Войдите, чтобы открыть курс"
        description="Карта модулей и прогресс доступны после входа в учебный кабинет CyberEdu."
        icon={<LogIn className="size-7 opacity-70" aria-hidden />}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary">
              <Link href={guestAuthLinks.login}>Войти</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={guestAuthLinks.register}>Зарегистрироваться</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
