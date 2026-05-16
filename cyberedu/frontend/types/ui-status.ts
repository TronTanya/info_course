/** Состояния сущностей курса (модули, задания, отправки) для UI. */
export type UiStatus =
  | "loading"
  | "success"
  | "error"
  | "empty"
  | "locked"
  | "completed"
  | "in_progress"
  | "pending"
  | "warning";
