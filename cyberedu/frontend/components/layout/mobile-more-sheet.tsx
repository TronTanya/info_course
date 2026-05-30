"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  studentMobileMoreKeys,
  studentQuickNav,
  studentSecondaryNav,
} from "@/lib/design-system/nav-config";
import { useStudentNavModuleId } from "@/hooks/use-student-nav-module-id";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";
import type { StudentQuickNavKey } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

const navByKey = Object.fromEntries(studentQuickNav.map((item) => [item.key, item])) as Record<
  StudentQuickNavKey,
  (typeof studentQuickNav)[number]
>;

export function MobileMoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? "";
  const moduleId = useStudentNavModuleId();
  const paths = resolveStudentNavPaths(pathname, moduleId);
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="ce-mobile-sheet-overlay ce-mobile-sheet-overlay--framer lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            aria-label="Закрыть меню"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Дополнительные разделы"
            className="ce-mobile-sheet ce-mobile-sheet--framer lg:hidden"
            initial={reduce ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="ce-mobile-sheet__handle" aria-hidden />
            <header className="ce-mobile-sheet__header">
              <div>
                <p className="font-heading text-base font-semibold text-foreground">Ещё</p>
                <p className="text-xs text-muted-foreground">Уроки, тесты и настройки</p>
              </div>
              <button
                type="button"
                className="ce-mobile-tab-more"
                onClick={onClose}
                aria-label="Закрыть"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>
            <div className="ce-mobile-sheet__body">
              <p className="ce-learn-os-eyebrow mb-2 px-1">Обучение</p>
              <ul className="space-y-1">
                {studentMobileMoreKeys.map((key) => {
                  const item = navByKey[key];
                  if (!item) return null;
                  const Icon = item.icon;
                  const active = isStudentQuickNavActive(pathname, key);
                  return (
                    <li key={key}>
                      <Link
                        href={paths[key]}
                        onClick={onClose}
                        className={cn("ce-mobile-sheet-link", active && "ce-mobile-sheet-link--active")}
                      >
                        <span className="ce-mobile-sheet-link__icon">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-medium">{item.label}</span>
                          {item.description ? (
                            <span className="block text-xs text-muted-foreground">{item.description}</span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="ce-learn-os-eyebrow mb-2 mt-5 px-1">Кабинет</p>
              <ul className="space-y-1">
                {studentSecondaryNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn("ce-mobile-sheet-link", active && "ce-mobile-sheet-link--active")}
                      >
                        <span className="ce-mobile-sheet-link__icon">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-medium">{item.label}</span>
                          {item.description ? (
                            <span className="block text-xs text-muted-foreground">{item.description}</span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
