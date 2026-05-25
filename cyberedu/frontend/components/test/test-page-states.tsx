"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileQuestion,
  Lock,
  LogIn,
  RotateCcw,
} from "lucide-react";
import type { TestPageEmptyKind, TestPageLoadErrorKind } from "@/lib/test-page-state";
import { resolveTestClientErrorDisplay } from "@/lib/test-page-state";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { Alert } from "@/components/ui/alert";

const LOAD_ERROR_COPY: Record<
  TestPageLoadErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  load: {
    terminalLine: "assessment --load failed",
    title: "Не удалось загрузить тест",
    description:
      "Данные теста временно недоступны. Обновите страницу или вернитесь к карте курса и откройте модуль снова.",
  },
  progress: {
    terminalLine: "assessment --progress failed",
    title: "Не удалось загрузить прогресс",
    description:
      "Прогресс модуля не загрузился. Без него тест может быть недоступен — повторите попытку.",
  },
  access: {
    terminalLine: "assessment --access denied",
    title: "Ошибка доступа",
    description:
      "У вас нет доступа к этому тесту или модуль временно закрыт. Вернитесь к урокам модуля.",
  },
};

const EMPTY_COPY: Record<
  TestPageEmptyKind,
  { title: string; description: string; terminalLine: string }
> = {
  module_not_found: {
    terminalLine: "module --not-found",
    title: "Модуль не найден",
    description:
      "Модуль отсутствует или снят с программы. Откройте карту курса — там отображаются доступные модули.",
  },
  test_not_found: {
    terminalLine: "test --not-found",
    title: "Тест не найден",
    description:
      "Для этого модуля пока не добавлен контрольный тест. Вернитесь к лекции или карте курса.",
  },
  no_questions: {
    terminalLine: "test --empty",
    title: "Вопросы отсутствуют",
    description:
      "Тест создан, но в нём ещё нет вопросов. Попробуйте позже или обратитесь к преподавателю.",
  },
};

function StateWrap({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">{children}</div>;
}

function TestPageRetryButton() {
  const router = useRouter();
  return (
    <Button type="button" variant="primary" onClick={() => router.refresh()}>
      <RotateCcw className="size-4" aria-hidden />
      Обновить страницу
    </Button>
  );
}

export function TestUnauthorizedState() {
  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine="auth --required"
        title="Войдите, чтобы пройти тест"
        description="Контрольный тест, попытки и результаты доступны после входа в учебный кабинет CyberEdu."
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

export function TestPageLoadError({
  kind,
  onRetry,
}: {
  kind: TestPageLoadErrorKind;
  onRetry?: () => void;
}) {
  const copy = LOAD_ERROR_COPY[kind];
  return (
    <StateWrap>
      <ErrorCard
        className="max-w-lg w-full"
        server
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {onRetry ? (
              <Button type="button" variant="primary" onClick={onRetry}>
                <RotateCcw className="size-4" aria-hidden />
                Попробовать снова
              </Button>
            ) : (
              <TestPageRetryButton />
            )}
            <Button asChild variant="outline">
              <Link href="/dashboard/course">Вернуться к курсу</Link>
            </Button>
          </div>
        }
      />
    </StateWrap>
  );
}

export function TestPageEmptyState({
  kind,
  moduleTitle,
  moduleId,
  compact = false,
}: {
  kind: TestPageEmptyKind;
  moduleTitle?: string;
  moduleId?: string;
  /** Внутри раннера — без полноэкранного центрирования */
  compact?: boolean;
}) {
  const copy = EMPTY_COPY[kind];
  const moduleHref = moduleId ? `/dashboard/course/${moduleId}` : "/dashboard/course";
  const lessonHref = moduleId ? `/dashboard/course/${moduleId}/lesson` : moduleHref;
  const contextHint = moduleTitle?.trim() ? `Модуль: ${moduleTitle.trim()}.` : null;
  const description = contextHint ? `${copy.description} ${contextHint}` : copy.description;

  const body = (
      <EmptyState
        className="max-w-lg w-full"
        terminalLine={copy.terminalLine}
        title={copy.title}
        description={description}
        icon={
          kind === "module_not_found" ? (
            <BookOpen className="size-7 opacity-70" aria-hidden />
          ) : kind === "no_questions" ? (
            <FileQuestion className="size-7 opacity-70" aria-hidden />
          ) : (
            <ClipboardList className="size-7 opacity-70" aria-hidden />
          )
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {kind !== "module_not_found" ? (
              <Button asChild variant="primary">
                <Link href={lessonHref}>К лекции модуля</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/dashboard/course">Вернуться к курсу</Link>
            </Button>
          </div>
        }
      />
  );

  if (compact) return body;
  return <StateWrap>{body}</StateWrap>;
}

export function TestLockedState({
  reason,
  lessonHref,
  moduleTitle,
}: {
  reason: string;
  lessonHref: string;
  moduleTitle?: string;
}) {
  const description = moduleTitle?.trim()
    ? `${reason} Модуль: ${moduleTitle.trim()}.`
    : reason;

  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine="assessment --locked"
        title="Тест пока недоступен"
        description={description}
        icon={<Lock className="size-7 opacity-70" aria-hidden />}
        action={
          <Button asChild variant="primary">
            <Link href={lessonHref}>Вернуться к урокам</Link>
          </Button>
        }
      />
    </StateWrap>
  );
}

/** Ошибка отправки теста (клиент, после Server Action). */
export function TestSubmitErrorAlert({
  message,
  onRetry,
  pending,
}: {
  message: string;
  onRetry?: () => void;
  pending?: boolean;
}) {
  return (
    <ErrorCard
      className="w-full"
      title="Не удалось отправить тест"
      description={message}
      action={
        onRetry ? (
          <Button type="button" variant="primary" size="md" disabled={pending} onClick={onRetry}>
            Повторить отправку
          </Button>
        ) : undefined
      }
    />
  );
}

/** Ошибка доступа на клиенте (submit / действие). */
export function TestAccessErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="warning" title="Нет доступа к тесту">
      {message}
    </Alert>
  );
}

/** Общая клиентская ошибка с санитизацией. */
export function TestClientErrorBanner({
  error,
  onRetrySubmit,
  pending,
}: {
  error: string;
  onRetrySubmit?: () => void;
  pending?: boolean;
}) {
  const { kind, message } = resolveTestClientErrorDisplay(error);
  if (kind === "submit") {
    return <TestSubmitErrorAlert message={message} onRetry={onRetrySubmit} pending={pending} />;
  }
  if (kind === "access") {
    return <TestAccessErrorAlert message={message} />;
  }
  return (
    <Alert variant="danger" title="Что-то пошло не так">
      {message}
    </Alert>
  );
}
