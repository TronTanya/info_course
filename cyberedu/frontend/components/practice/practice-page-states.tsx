"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, FlaskConical, Lock, LogIn, RotateCcw } from "lucide-react";
import type { PracticePageEmptyKind, PracticePageLoadErrorKind } from "@/lib/practice-page-state";
import { resolvePracticeClientErrorDisplay } from "@/lib/practice-page-state";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { PracticeLabSkeleton } from "@/components/practice/practice-lab-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { Alert } from "@/components/ui/alert";

const LOAD_ERROR_COPY: Record<
  PracticePageLoadErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  load: {
    terminalLine: "lab --load failed",
    title: "Не удалось загрузить практику",
    description:
      "Данные лаборатории временно недоступны. Обновите страницу или вернитесь к карте курса и откройте модуль снова.",
  },
  progress: {
    terminalLine: "lab --progress failed",
    title: "Не удалось загрузить прогресс",
    description:
      "Прогресс модуля не загрузился. Без него практика может быть недоступна — повторите попытку.",
  },
  access: {
    terminalLine: "lab --access denied",
    title: "Ошибка доступа",
    description:
      "У вас нет доступа к этой практике или модуль временно закрыт. Вернитесь к карте курса и проверьте порядок прохождения.",
  },
};

const EMPTY_COPY: Record<
  PracticePageEmptyKind,
  { title: string; description: string; terminalLine: string }
> = {
  module_not_found: {
    terminalLine: "module --not-found",
    title: "Модуль не найден",
    description:
      "Модуль отсутствует или снят с программы. Откройте карту курса — там отображаются доступные модули.",
  },
  practice_not_found: {
    terminalLine: "lab --no-tasks",
    title: "Практика не найдена",
    description:
      "Для этого модуля пока нет опубликованных лабораторных заданий. Вернитесь к лекции и тесту или дождитесь публикации.",
  },
};

function StateWrap({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">{children}</div>;
}

export function PracticePageRetryButton() {
  const router = useRouter();
  return (
    <Button type="button" variant="primary" onClick={() => router.refresh()}>
      <RotateCcw className="size-4" aria-hidden />
      Обновить страницу
    </Button>
  );
}

function ErrorActions({ courseHref = "/dashboard/course" }: { courseHref?: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <PracticePageRetryButton />
      <Button asChild variant="outline">
        <Link href={courseHref}>Вернуться к курсу</Link>
      </Button>
    </div>
  );
}

export function PracticePageLoadingState() {
  return (
    <div className="lab-shell ce-learn-lab overflow-hidden rounded-2xl border" aria-busy="true">
      <PracticeLabSkeleton />
    </div>
  );
}

export function PracticeUnauthorizedState() {
  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine="auth --required"
        title="Войдите, чтобы открыть практику"
        description="Лаборатория, отправка ответов и AI-наставник доступны после входа в учебный кабинет CyberEdu."
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

export function PracticePageLoadError({ kind }: { kind: PracticePageLoadErrorKind }) {
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

export function PracticePageEmptyState({
  kind,
  moduleId,
  moduleTitle,
}: {
  kind: PracticePageEmptyKind;
  moduleId?: string;
  moduleTitle?: string;
}) {
  const copy = EMPTY_COPY[kind];
  const contextHint =
    moduleTitle?.trim() && kind === "practice_not_found"
      ? `Модуль: ${moduleTitle.trim()}.`
      : null;
  const description = contextHint ? `${copy.description} ${contextHint}` : copy.description;
  const moduleHref = moduleId ? `/dashboard/course/${moduleId}` : "/dashboard/course";

  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine={copy.terminalLine}
        title={copy.title}
        description={description}
        icon={
          kind === "practice_not_found" ? (
            <FlaskConical className="size-7 opacity-80 text-primary" aria-hidden />
          ) : (
            <FileQuestion className="size-7 opacity-70" aria-hidden />
          )
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {kind === "practice_not_found" && moduleId ? (
              <Button asChild variant="primary">
                <Link href={moduleHref}>К модулю</Link>
              </Button>
            ) : null}
            <Button asChild variant={kind === "practice_not_found" ? "outline" : "primary"}>
              <Link href="/dashboard/course">Вернуться к курсу</Link>
            </Button>
          </div>
        }
      />
    </StateWrap>
  );
}

function practiceLockedCta(
  code: string,
  moduleId: string,
): { href: string; label: string; secondary?: { href: string; label: string } } {
  switch (code) {
    case "TEST":
      return {
        href: `/dashboard/course/${moduleId}/test`,
        label: "Вернуться к тесту",
        secondary: { href: "/dashboard/course", label: "Вернуться к курсу" },
      };
    case "LESSON":
    case "VIDEO":
      return {
        href: `/dashboard/course/${moduleId}/lesson`,
        label: "Вернуться к лекции",
        secondary: { href: "/dashboard/course", label: "Вернуться к курсу" },
      };
    default:
      return { href: "/dashboard/course", label: "Вернуться к курсу" };
  }
}

export function PracticeLockedState({
  reason,
  code,
  moduleId,
  moduleTitle,
}: {
  reason: string;
  code: string;
  moduleId: string;
  moduleTitle?: string;
}) {
  const cta = practiceLockedCta(code, moduleId);
  const description = moduleTitle?.trim() ? `${reason} Модуль: ${moduleTitle.trim()}.` : reason;

  return (
    <StateWrap>
      <EmptyState
        className="max-w-lg w-full"
        terminalLine="lab --locked"
        title="Практика недоступна"
        description={description}
        icon={<Lock className="size-7 opacity-70" aria-hidden />}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
            {cta.secondary ? (
              <Button asChild variant="outline">
                <Link href={cta.secondary.href}>{cta.secondary.label}</Link>
              </Button>
            ) : null}
          </div>
        }
      />
    </StateWrap>
  );
}

export function PracticeSubmitErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" title="Не удалось отправить ответ">
      {message}
    </Alert>
  );
}

export function PracticeUploadErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" title="Не удалось загрузить файл">
      {message}
    </Alert>
  );
}

export function PracticeAccessErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="warning" title="Нет доступа">
      {message}
    </Alert>
  );
}

export function PracticeLoadErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" title="Не удалось загрузить данные">
      {message}
    </Alert>
  );
}

export function PracticeClientErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" title="Что-то пошло не так">
      {message}
    </Alert>
  );
}

export function PracticeClientErrorBanner({ error }: { error: string }) {
  const { kind, message } = resolvePracticeClientErrorDisplay(error);
  if (kind === "submit") return <PracticeSubmitErrorAlert message={message} />;
  if (kind === "upload") return <PracticeUploadErrorAlert message={message} />;
  if (kind === "access") return <PracticeAccessErrorAlert message={message} />;
  if (kind === "load") return <PracticeLoadErrorAlert message={message} />;
  return <PracticeClientErrorAlert message={message} />;
}

/** Компактный empty для секции (сценарий / артефакты / инструкции). */
export function PracticeSectionEmpty({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center sm:py-8">
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/25 text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
