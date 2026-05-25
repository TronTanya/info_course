"use client";

/**
 * Объявления для screen readers при смене статуса (формы, действия).
 * Видимые сообщения дублируйте отдельно (Alert / AdminActionError).
 */
export function AdminLiveRegion({
  message,
  politeness = "polite",
}: {
  message: string | null | undefined;
  politeness?: "polite" | "assertive";
}) {
  if (!message?.trim()) return null;
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
