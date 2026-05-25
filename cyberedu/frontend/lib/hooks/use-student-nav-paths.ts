"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  NAV_MODULE_CHANGED_EVENT,
  resolveStudentNavPaths,
  syncLastModuleIdFromPathname,
  type StudentNavPaths,
} from "@/lib/nav-resolve";

/**
 * Пути быстрой навигации с учётом последнего модуля курса (sessionStorage).
 * До гидрации используем только moduleId из URL — иначе href на клиенте
 * (sessionStorage) не совпадает с SSR и ломается гидрация/скролл.
 */
export function useStudentNavPaths(): StudentNavPaths {
  const pathname = usePathname() ?? "";
  const [lastModuleId, setLastModuleId] = useState<string | null>(null);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    setNavReady(true);
    setLastModuleId(syncLastModuleIdFromPathname(pathname));
  }, [pathname]);

  useEffect(() => {
    function onModuleChanged(event: Event) {
      const id = (event as CustomEvent<{ moduleId?: string }>).detail?.moduleId;
      if (id) setLastModuleId(id);
    }
    window.addEventListener(NAV_MODULE_CHANGED_EVENT, onModuleChanged);
    return () => window.removeEventListener(NAV_MODULE_CHANGED_EVENT, onModuleChanged);
  }, []);

  return useMemo(
    () =>
      resolveStudentNavPaths(pathname, {
        lastModuleId: navReady ? lastModuleId : null,
      }),
    [pathname, lastModuleId, navReady],
  );
}
