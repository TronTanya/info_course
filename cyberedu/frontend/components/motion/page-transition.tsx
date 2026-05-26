"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageTransition } from "@/lib/design-system/motion";

function isImmersivePath(pathname: string): boolean {
  return /\/lesson\/|\/practice\/|\/test(?:\/|$)/.test(pathname);
}

/** Кабинет/админка: без blur-перехода — иначе таблицы «мигают» и текст пропадает */
function isStableShellPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  const skip = reduce || isImmersivePath(pathname) || isStableShellPath(pathname);
  const preset = pageTransition(skip);

  if (skip) {
    return <div className="ce-motion-page ce-motion-page--static w-full min-w-0">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="ce-motion-page min-w-0 flex-1"
        initial={preset.initial}
        animate={preset.animate}
        exit={preset.exit}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
