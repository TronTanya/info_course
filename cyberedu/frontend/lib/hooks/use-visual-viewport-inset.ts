"use client";

import { useEffect, useState } from "react";

/**
 * Нижний отступ при открытой виртуальной клавиатуре (iOS/Android).
 * `innerHeight - visualViewport.height - offsetTop` ≈ высота перекрытия снизу.
 */
export function useVisualViewportInset(enabled = true): number {
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      const viewport = window.visualViewport;
      if (!viewport) return;
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setBottom(Math.round(inset));
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return enabled ? bottom : 0;
}
