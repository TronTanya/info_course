import type { AnalyticsEventName } from "@/lib/analytics/events";
import {
  type AnalyticsDispatchDetail,
  type SafeAnalyticsProps,
  sanitizeAnalyticsProps,
} from "@/lib/analytics/payload";

const ANALYTICS_DEBUG =
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1" ||
  process.env.NODE_ENV === "development";

/**
 * Внутренний трекинг UI-событий.
 *
 * - Не отправляет данные во внешние сервисы (нет конфигурации провайдера).
 * - Не логирует ответы тестов, тексты практик, email и прочие PII.
 * - В dev / при NEXT_PUBLIC_ANALYTICS_DEBUG=1 пишет JSON в console через structured log.
 * - Для будущего провайдера: слушайте `cyberedu:analytics` на `window`.
 *
 * TODO(analytics): при появлении NEXT_PUBLIC_ANALYTICS_PROVIDER подключить адаптер
 * (PostHog / Plausible / self-hosted) и вызывать его здесь с тем же контрактом событий.
 */
export function trackAnalyticsEvent(
  event: AnalyticsEventName,
  props?: SafeAnalyticsProps,
): void {
  if (typeof window === "undefined") return;

  const safe = sanitizeAnalyticsProps(props);
  const detail: AnalyticsDispatchDetail = { event, ...safe };

  window.dispatchEvent(new CustomEvent<AnalyticsDispatchDetail>("cyberedu:analytics", { detail }));

  if (ANALYTICS_DEBUG) {
    void import("@/lib/log/structured").then(({ logInfo }) => {
      logInfo("analytics_event", {
        event,
        ...Object.fromEntries(
          Object.entries(safe ?? {}).map(([k, v]) => [k, v]),
        ),
      });
    });
  }
}
