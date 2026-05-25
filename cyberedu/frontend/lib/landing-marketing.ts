import type { LandingPublicStats } from "@/lib/landing-public-stats";

export type LandingMetricItem = {
  key: string;
  label: string;
  value: string;
  hint: string;
  variant: "default" | "cyan" | "accent";
};

const STATIC_METRICS: LandingMetricItem[] = [
  {
    key: "modules",
    label: "Модули курса",
    value: "12+",
    hint: "Пошаговый трек от основ к SOC",
    variant: "default",
  },
  {
    key: "labs",
    label: "Лаборатории",
    value: "24+",
    hint: "Сценарии в браузере",
    variant: "cyan",
  },
  {
    key: "mentor",
    label: "AI-наставник",
    value: "24/7",
    hint: "Без готовых ответов на тесты",
    variant: "accent",
  },
  {
    key: "cert",
    label: "Сертификат",
    value: "PDF + QR",
    hint: "Публичная проверка",
    variant: "default",
  },
  {
    key: "security",
    label: "Платформа",
    value: "RBAC",
    hint: "Аудит и rate limits",
    variant: "cyan",
  },
];

function formatCount(n: number, suffix = ""): string {
  if (n <= 0) return "—";
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k${suffix}`;
  return `${n}${suffix}`;
}

/** Метрики для лендинга: живые из БД или маркетинговый fallback. */
export function resolveLandingMetrics(stats: LandingPublicStats): {
  items: LandingMetricItem[];
  live: boolean;
} {
  const live = stats.activeModules > 0 || stats.practiceTasks > 0;
  if (!live) {
    return { items: STATIC_METRICS, live: false };
  }

  return {
    live: true,
    items: [
      {
        key: "modules",
        label: "Активных модулей",
        value: formatCount(stats.activeModules),
        hint: "В программе курса",
        variant: "default",
      },
      {
        key: "labs",
        label: "Практических заданий",
        value: formatCount(stats.practiceTasks),
        hint: "Лаборатории в браузере",
        variant: "cyan",
      },
      {
        key: "certs",
        label: "Сертификатов",
        value: formatCount(stats.certificatesIssued, "+"),
        hint: "Выдано выпускникам",
        variant: "accent",
      },
      {
        key: "students",
        label: "Студентов",
        value: formatCount(stats.totalUsers, "+"),
        hint: "Зарегистрировано на платформе",
        variant: "default",
      },
      {
        key: "mentor",
        label: "AI-наставник",
        value: "24/7",
        hint: "Модерация на сервере",
        variant: "cyan",
      },
    ],
  };
}
