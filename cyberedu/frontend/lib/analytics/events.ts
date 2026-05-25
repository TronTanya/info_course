/** Имена UI-событий (стабильный контракт для будущего провайдера). */
export const AnalyticsEvents = {
  courseContinueClicked: "course_continue_clicked",
  moduleOpened: "module_opened",
  lessonOpened: "lesson_opened",
  testStarted: "test_started",
  practiceOpened: "practice_opened",
  practiceHintOpened: "practice_hint_opened",
  certificateProgressOpened: "certificate_progress_opened",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
