/** Ближайший предок с собственной полосой прокрутки (не window). */
export function findScrollableParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const y = style.overflowY;
    const x = style.overflowX;
    const scrollableY =
      (y === "auto" || y === "scroll" || y === "overlay") &&
      node.scrollHeight > node.clientHeight + 1;
    const scrollableX =
      (x === "auto" || x === "scroll" || x === "overlay") &&
      node.scrollWidth > node.clientWidth + 1;
    if (scrollableY || scrollableX) return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Прокручивает элемент внутри контейнера, не трогая window.
 * (scrollIntoView на ссылке оглавления иначе «кидает» страницу наверх.)
 */
export function scrollIntoContainer(
  el: HTMLElement,
  container: HTMLElement,
  options?: { padding?: number; behavior?: ScrollBehavior },
): void {
  const pad = options?.padding ?? 8;
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  let deltaY = 0;
  if (elRect.top < containerRect.top + pad) {
    deltaY = elRect.top - containerRect.top - pad;
  } else if (elRect.bottom > containerRect.bottom - pad) {
    deltaY = elRect.bottom - containerRect.bottom + pad;
  }

  let deltaX = 0;
  if (elRect.left < containerRect.left + pad) {
    deltaX = elRect.left - containerRect.left - pad;
  } else if (elRect.right > containerRect.right - pad) {
    deltaX = elRect.right - containerRect.right + pad;
  }

  if (deltaX === 0 && deltaY === 0) return;

  const top = container.scrollTop + deltaY;
  const left = container.scrollLeft + deltaX;
  if (options?.behavior === "smooth") {
    container.scrollTo({ top, left, behavior: "smooth" });
  } else {
    container.scrollTop = top;
    container.scrollLeft = left;
  }
}

/** Подсветка активного пункта: только внутренний скролл панели, без document. */
export function scrollElementWithinNearestContainer(
  el: HTMLElement,
  options?: { padding?: number; behavior?: ScrollBehavior },
): void {
  const container = findScrollableParent(el);
  if (!container) return;
  scrollIntoContainer(el, container, options);
}
