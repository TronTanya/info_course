/** UI-статусы сущностей курса (модули, шаги урок/тест/практика). Не дублируют Prisma-enum без маппера. */
export type CourseEntityUiStatus =
  | "completed"
  | "in_progress"
  | "available"
  | "locked"
  | "pending_review"
  | "needs_retry";

/** Акцент на карте: текущий фокус модуля (поверх in_progress). */
export type CourseRoadmapFocusStatus = CourseEntityUiStatus | "current";
