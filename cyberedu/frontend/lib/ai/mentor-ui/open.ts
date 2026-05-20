/** Открыть плавающую панель AI-наставника на текущей странице. */
export function openMentorChat(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cyberedu:open-mentor"));
}
