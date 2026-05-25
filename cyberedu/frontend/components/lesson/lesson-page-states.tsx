import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, FileQuestion, Lock, LogIn } from "lucide-react";
import type { LessonPageEmptyKind, LessonPageLoadErrorKind } from "@/lib/lesson-page-load";
import { resolveLessonClientErrorDisplay } from "@/lib/lesson-page-state";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { LessonPageRetryButton } from "@/components/lesson/lesson-page-retry-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { Alert } from "@/components/ui/alert";

const LOAD_ERROR_COPY: Record<
  LessonPageLoadErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  lesson: {
    terminalLine: "lesson --load failed",
    title: "Не удалось загрузить урок",
    description:
      "Материал лекции временно недоступен. Обновите страницу или вернитесь к карте курса и откройте модуль снова.",
  },
  progress: {
    terminalLine: "lesson --progress failed",
    title: "Не удалось загрузить прогресс",
    description:
      "Данные о прохождении модуля не загрузились. Повторите попытку — без сохранённого прогресса часть кнопок может быть недоступна.",
  },
  access: {
    terminalLine: "lesson --access denied",
    title: "Ошибка доступа",
    description:
      "У вас нет доступа к этому уроку или модуль временно недоступен. Вернитесь к карте курса и проверьте порядок прохождения.",
  },
};

const EMPTY_COPY: Record<
  LessonPageEmptyKind,
  { title: string; description: string; terminalLine: string }
> = {
  module_not_found: {
    terminalLine: "module --not-found",
    title: "Модуль не найден",
    description:
      "Модуль отсутствует или снят с программы. Откройте карту курса — там отображаются доступные модули.",
  },
  lesson_not_found: {
    terminalLine: "lesson --not-found",
    title: "Урок не найден",
    description:
      "В этом модуле пока нет материала лекции. Вернитесь к курсу или дождитесь публикации урока администратором.",
  },
  content_empty: {
    terminalLine: "lesson --content empty",
    title: "Контент урока отсутствует",
    description:
      "Заголовок урока есть, но текст лекции ещё не опубликован. Попробуйте позже или перейдите к следующему шагу модуля, если он уже открыт.",
  },
};

function StateWrap({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">{children}</div>;
}

function ErrorActions({ courseHref = "/dashboard/course" }: { courseHref?: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <LessonPageRetryButton />
      <Button asChild variant="outline">
        <Link href={courseHref}>Вернуться к курсу</Link>
      </Button>
    </div>
  );
}

export function LessonUnauthorizedState() {
  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine="auth --required"
        title="Войдите, чтобы открыть урок"
        description="Материал лекции, прогресс и AI-наставник доступны после входа в учебный кабинет CyberEdu."
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
    </StateWrap>
  );
}

export function LessonPageLoadError({ kind }: { kind: LessonPageLoadErrorKind }) {
  const copy = LOAD_ERROR_COPY[kind];
  return (
    <StateWrap>
      <ErrorCard
        className="max-w-lg w-full"
        server
        title={copy.title}
        description={copy.description}
        action={<ErrorActions />}
      />
    </StateWrap>
  );
}

export function LessonPageEmptyState({
  kind,
  moduleTitle,
  lessonTitle,
}: {
  kind: LessonPageEmptyKind;
  moduleTitle?: string;
  lessonTitle?: string;
}) {
  const copy = EMPTY_COPY[kind];
  const contextHint =
    kind === "content_empty" && moduleTitle?.trim()
      ? `Модуль: ${moduleTitle.trim()}${lessonTitle?.trim() ? `. Урок: ${lessonTitle.trim()}.` : "."}`
      : null;
  const description = contextHint ? `${copy.description} ${contextHint}` : copy.description;

  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine={copy.terminalLine}
        title={copy.title}
        description={description}
        icon={
          kind === "lesson_not_found" || kind === "content_empty" ? (
            <FileQuestion className="size-7 opacity-70" aria-hidden />
          ) : (
            <BookOpen className="size-7 opacity-70" aria-hidden />
          )
        }
        action={
          <Button asChild variant="primary">
            <Link href="/dashboard/course">Вернуться к курсу</Link>
          </Button>
        }
      />
    </StateWrap>
  );
}

export function LessonLockedState({
  reason,
  moduleTitle,
}: {
  reason: string;
  moduleTitle?: string;
}) {
  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine="module --locked"
        title="Урок пока недоступен"
        description={
          moduleTitle ? `${reason} Модуль: ${moduleTitle}.` : reason
        }
        icon={<Lock className="size-7 opacity-70" aria-hidden />}
        action={
          <Button asChild variant="primary">
            <Link href="/dashboard/course">Вернуться к курсу</Link>
          </Button>
        }
      />
    </StateWrap>
  );
}

/** Ошибка сохранения прогресса на клиенте (после действия «Завершить урок»). */
export function LessonProgressSaveAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" title="Не удалось сохранить прогресс">
      {message}
    </Alert>
  );
}

/** Ошибка доступа на клиенте (AI, завершение урока). */
export function LessonAccessAlert({ message }: { message: string }) {
  return (
    <Alert variant="warning" title="Нет доступа">
      {message}
    </Alert>
  );
}

/** Общая ошибка на клиенте (AI-адаптация и т.д.). */
export function LessonClientErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" title="Что-то пошло не так">
      {message}
    </Alert>
  );
}

/** Клиентская ошибка с классификацией: прогресс / доступ / загрузка / общая. */
export function LessonClientErrorBanner({ error }: { error: string }) {
  const { kind, message } = resolveLessonClientErrorDisplay(error);
  if (kind === "progress_save") {
    return <LessonProgressSaveAlert message={message} />;
  }
  if (kind === "access") {
    return <LessonAccessAlert message={message} />;
  }
  if (kind === "load") {
    return (
      <Alert variant="danger" title="Не удалось загрузить данные">
        {message}
      </Alert>
    );
  }
  return <LessonClientErrorAlert message={message} />;
}
