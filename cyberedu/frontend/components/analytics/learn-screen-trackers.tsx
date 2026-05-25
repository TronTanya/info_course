"use client";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { TrackOnMount } from "@/components/analytics/track-on-mount";

export function ModuleOpenedTracker({
  moduleId,
  source = "module_hub",
}: {
  moduleId: string;
  source?: string;
}) {
  return (
    <TrackOnMount event={AnalyticsEvents.moduleOpened} moduleId={moduleId} source={source} />
  );
}

export function LessonOpenedTracker({
  moduleId,
  lessonId,
  source = "lesson_page",
}: {
  moduleId: string;
  lessonId: string;
  source?: string;
}) {
  return (
    <TrackOnMount
      event={AnalyticsEvents.lessonOpened}
      moduleId={moduleId}
      lessonId={lessonId}
      source={source}
    />
  );
}

export function PracticeOpenedTracker({
  moduleId,
  practiceId,
  source = "practice_page",
}: {
  moduleId: string;
  practiceId?: string;
  source?: string;
}) {
  return (
    <TrackOnMount
      event={AnalyticsEvents.practiceOpened}
      moduleId={moduleId}
      practiceId={practiceId}
      source={source}
    />
  );
}

export function CertificateProgressOpenedTracker({
  source = "certificate_page",
}: {
  source?: string;
}) {
  return (
    <TrackOnMount event={AnalyticsEvents.certificateProgressOpened} source={source} />
  );
}
