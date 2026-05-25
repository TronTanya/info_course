"use client";

import { useEffect } from "react";
import { syncStudentNavModule } from "@/lib/nav-module-context";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

/** Запоминает модуль курса для ссылок «Уроки / Тесты / Практика» в меню. */
export function StudentNavModuleSync({
  stats,
  modules,
}: {
  stats: ProfileCourseStats | null;
  modules: CourseProgressModuleRow[];
}) {
  useEffect(() => {
    syncStudentNavModule(stats, modules);
  }, [stats, modules]);

  return null;
}
