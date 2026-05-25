"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import { sanitizeAnalyticsProps, type SafeAnalyticsProps } from "@/lib/analytics/payload";
import { trackAnalyticsEvent } from "@/lib/analytics/track";

type TrackOnMountProps = SafeAnalyticsProps & {
  event: AnalyticsEventName;
};

/** Однократное событие при открытии экрана (mount), без повторов Strict Mode — ref guard. */
export function TrackOnMount({
  event,
  moduleId,
  lessonId,
  testId,
  practiceId,
  source,
}: TrackOnMountProps) {
  const sent = useRef(false);
  const analytics = useMemo(
    () => sanitizeAnalyticsProps({ moduleId, lessonId, testId, practiceId, source }),
    [moduleId, lessonId, testId, practiceId, source],
  );

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackAnalyticsEvent(event, analytics);
  }, [event, analytics]);

  return null;
}
