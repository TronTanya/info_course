/** Страница лекции: вертикальная прокрутка у document, не у #main-content. */
export function isLessonDocumentScroll(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("ce-lesson-page-active") ||
    document.querySelector(".ce-lesson-premium-layout") != null
  );
}

/** Ближайший предок с вертикальной прокруткой (или window). */
export function getScrollParent(node: HTMLElement | null): HTMLElement | typeof window {
  if (isLessonDocumentScroll()) {
    return window;
  }

  if (!node) return window;
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      if (el.scrollHeight > el.clientHeight + 1) return el;
    }
    el = el.parentElement;
  }
  return window;
}

export function subscribeScroll(
  target: HTMLElement | typeof window,
  handler: () => void,
  options?: AddEventListenerOptions,
): () => void {
  target.addEventListener("scroll", handler, options);
  return () => target.removeEventListener("scroll", handler);
}
