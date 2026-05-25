import type { ComponentType, ReactNode } from "react";
import { LessonCallout, type LessonCalloutProps } from "@/components/lesson/lesson-ui/lesson-callout";
import { resolveLessonCalloutType } from "@/lib/lesson-callout-types";

type MdxCalloutProps = {
  type?: string;
  title?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * MDX-обёртка: `<Callout type="warning" title="…">…</Callout>`.
 * Подключение в MDXProvider: `import { lessonMdxComponents } from "…"`.
 */
export function MdxLessonCallout({ type, title, children, className }: MdxCalloutProps) {
  const resolved = resolveLessonCalloutType(type);
  return (
    <LessonCallout type={resolved} title={title} className={className}>
      {children}
    </LessonCallout>
  );
}

/** Реестр компонентов для MDX (если проект перейдёт на MDX для уроков). */
export const lessonMdxComponents: Record<string, ComponentType<MdxCalloutProps>> = {
  Callout: MdxLessonCallout,
  LessonCallout: MdxLessonCallout,
};

export type { LessonCalloutProps };
