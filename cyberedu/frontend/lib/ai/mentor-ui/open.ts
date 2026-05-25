/** Открыть плавающую панель AI-наставника на текущей странице. */
let pendingMentorOpen = false;

export function openMentorChat(): void {
  if (typeof window === "undefined") return;
  pendingMentorOpen = true;
  window.dispatchEvent(new CustomEvent("cyberedu:open-mentor"));
}

/** Считывает отложенное открытие после ленивой загрузки `AiMentorChat`. */
export function consumePendingMentorOpen(): boolean {
  const pending = pendingMentorOpen;
  pendingMentorOpen = false;
  return pending;
}
