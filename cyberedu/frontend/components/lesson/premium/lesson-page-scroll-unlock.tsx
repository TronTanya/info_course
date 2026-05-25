"use client";

import { useEffect } from "react";

/**
 * Маркер активной лекции для scroll-container / outline.
 * Прокрутка — у окна (document), без overflow:hidden на body.
 */
export function LessonPageScrollUnlock() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("ce-lesson-page-active");
    return () => root.classList.remove("ce-lesson-page-active");
  }, []);

  return null;
}
