"use client";

import { MentorDisabledState } from "@/components/ai/mentor/mentor-disabled-state";

/** @deprecated Используйте MentorDisabledState с reason="no_api_key". */
export function MentorUnavailableState() {
  return <MentorDisabledState reason="no_api_key" />;
}
