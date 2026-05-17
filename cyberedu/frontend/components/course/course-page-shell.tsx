"use client";

import type { ReactNode } from "react";
import { LearnPageShell } from "@/components/learn/learn-chrome";

export function CoursePageShell({ children }: { children: ReactNode }) {
  return <LearnPageShell>{children}</LearnPageShell>;
}
