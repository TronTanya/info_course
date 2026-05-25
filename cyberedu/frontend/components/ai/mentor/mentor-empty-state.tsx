"use client";

import { MENTOR_EMPTY_HEADLINE } from "@/lib/ai/mentor-ui/constants";

export function MentorEmptyState() {
  return (
    <p className="ce-mentor-empty px-1 py-6 text-center text-sm text-muted-foreground">
      {MENTOR_EMPTY_HEADLINE}
    </p>
  );
}
