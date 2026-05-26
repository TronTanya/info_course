export const MAX_VISIBLE_TOASTS = 3;

/** Ограничивает видимый стек toast (новые вытесняют старые). */
export function trimToastQueue<T>(queue: T[], max = MAX_VISIBLE_TOASTS): T[] {
  if (queue.length <= max) return queue;
  return queue.slice(-max);
}
