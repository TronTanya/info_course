"use client";

import type { TutorRefusalCode } from "@/lib/ai/tutor/types";
import { MentorRefusalState } from "@/components/ai/mentor/mentor-refusal-state";

/** Дополнительная подсказка под чатом после отказа модерации. */
export function MentorGuardrailCallout({ refusalCode }: { refusalCode?: TutorRefusalCode }) {
  return (
    <MentorRefusalState
      refusalCode={refusalCode}
      compact
      className="border-dashed"
    />
  );
}
