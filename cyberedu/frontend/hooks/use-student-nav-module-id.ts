"use client";

import { useStudentNavContextModuleId } from "@/components/layout/student-nav-provider";

/** ID модуля для ссылок «Уроки» / «Тесты» (контекст кабинета + localStorage). */
export function useStudentNavModuleId(): string | null {
  return useStudentNavContextModuleId();
}
