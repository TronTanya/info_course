export type DashboardEmptyKind =
  | "course_unavailable"
  | "not_started"
  | "no_progress"
  | "no_recommendations"
  | "no_activity";

export const DASHBOARD_EMPTY_COPY: Record<
  DashboardEmptyKind,
  { title: string; description: string; terminalLine: string }
> = {
  course_unavailable: {
    terminalLine: "dashboard --no-course",
    title: "Курс пока не подключён",
    description:
      "Программа обучения ещё не настроена. Когда курс появится, здесь отобразятся прогресс и следующие шаги.",
  },
  not_started: {
    terminalLine: "progress --not-started",
    title: "Вы ещё не начали обучение",
    description:
      "Откройте карту курса и пройдите первую лекцию — прогресс, рекомендации и история появятся в кабинете.",
  },
  no_progress: {
    terminalLine: "progress --empty",
    title: "Прогресс пока не зафиксирован",
    description:
      "Завершите урок или тест в любом модуле — процент и статистика обновятся автоматически.",
  },
  no_recommendations: {
    terminalLine: "weak-topics --empty",
    title: "Рекомендаций пока нет",
    description:
      "Когда появятся слабые темы или незачтённые попытки, наставник предложит, что повторить.",
  },
  no_activity: {
    terminalLine: "activity --empty",
    description: "Здесь появится история вашего обучения после лекций, тестов и практик.",
    title: "История пока пуста",
  },
};
