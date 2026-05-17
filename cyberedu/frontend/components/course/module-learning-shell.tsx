"use client";

import type { ReactNode } from "react";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import type { LearningPageContext } from "@/lib/learning-context";
import { LearningLayout } from "@/components/learn/learning-layout";
import { LearnPageHeader } from "@/components/learn/learn-chrome";

export function ModuleLearningShell({
  learning,
  moduleTitle,
  moduleProgressPercent,
  moduleStepsLabel,
  breadcrumbItems,
  eyebrow,
  title,
  description,
  children,
}: {
  learning: LearningPageContext;
  moduleTitle: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <LearningLayout
      courseTitle={learning.courseTitle}
      courseProgressPercent={learning.courseProgressPercent}
      moduleTitle={moduleTitle}
      moduleProgressPercent={moduleProgressPercent}
      moduleStepsLabel={moduleStepsLabel}
      modules={learning.modules}
      steps={learning.steps}
      neighbors={learning.neighbors}
      header={
        <LearnPageHeader
          backHref="/dashboard/course"
          backLabel="← Курс"
          breadcrumbItems={breadcrumbItems}
          eyebrow={eyebrow}
          title={title}
          subtitle={description}
          moduleProgressPercent={moduleProgressPercent}
          moduleStepsLabel={moduleStepsLabel}
        />
      }
    >
      {children}
    </LearningLayout>
  );
}
