/** Контрольные ширины viewport для ручной проверки (этап 15). */
export const LESSON_PAGE_BREAKPOINTS_PX = [360, 390, 768, 1024, 1440] as const;

/** До `lg` (1024px) — одна колонка, mobile CTA, collapsible-оглавление. */
export const LESSON_PAGE_MOBILE_MAX_PX = 1023;

/** CSS-маркеры разметки premium-страницы урока (контракт для тестов и регрессий). */
export const LESSON_MOBILE_LAYOUT_MARKERS = {
  layout: "ce-lesson-premium-layout",
  main: "ce-lesson-premium-main",
  content: "ce-lesson-page__content",
  footer: "ce-lesson-page__footer",
  mobileCta: "ce-lesson-mobile-cta",
  outlineMobile: "ce-lesson-outline__mobile",
  aiMentor: "ce-lesson-ai-mentor",
  stickyTabs: "ce-lesson-sticky-tabs",
} as const;
