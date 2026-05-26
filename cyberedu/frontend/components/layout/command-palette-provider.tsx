"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bot,
  BookOpen,
  Command,
  FlaskConical,
  GraduationCap,
  Moon,
  PlayCircle,
  Search,
  Sun,
  TestTube2,
} from "lucide-react";
import { commandPaletteAdminAction, commandPaletteStudentActions } from "@/lib/design-system/nav-config";
import { openMentorChat } from "@/lib/ai/mentor-ui/open";
import { useTheme } from "@/components/theme/theme-provider";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

type PaletteItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  keywords?: string;
};

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { resolved, setTheme } = useTheme();

  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";
  const moduleMatch = pathname.match(/\/dashboard\/course\/([^/]+)/);
  const moduleId = moduleMatch?.[1];

  const items = React.useMemo<PaletteItem[]>(() => {
    if (!isAuthenticated) return [];

    const navSources = isAdmin
      ? [...commandPaletteStudentActions, commandPaletteAdminAction]
      : commandPaletteStudentActions;

    const nav: PaletteItem[] = navSources.map((a) => ({
      id: a.href,
      label: a.label,
      description: a.description,
      icon: a.icon,
      run: () => {
        setOpen(false);
        setQuery("");
        router.push(a.href);
      },
      keywords: a.href,
    }));

    const extra: PaletteItem[] = [
      {
        id: "continue",
        label: "Продолжить обучение",
        description: "Карта курса и текущий модуль",
        icon: PlayCircle,
        run: () => {
          setOpen(false);
          router.push(moduleId ? `/dashboard/course/${moduleId}/lesson` : "/dashboard/course");
        },
        keywords: "continue lesson",
      },
      {
        id: "theme",
        label: resolved === "dark" ? "Светлая тема" : "Тёмная тема",
        description: "Переключить оформление",
        icon: resolved === "dark" ? Sun : Moon,
        run: () => {
          setTheme(resolved === "dark" ? "light" : "dark");
          setOpen(false);
        },
        keywords: "theme",
      },
      {
        id: "ai-mentor",
        label: "AI-наставник",
        description: "Открыть чат наставника",
        icon: Bot,
        run: () => {
          setOpen(false);
          openMentorChat();
        },
        keywords: "mentor ai chat",
      },
    ];

    if (moduleId) {
      extra.push(
        {
          id: "mod-hub",
          label: "Хаб модуля",
          icon: GraduationCap,
          run: () => {
            setOpen(false);
            router.push(`/dashboard/course/${moduleId}`);
          },
        },
        {
          id: "mod-lesson",
          label: "Лекция модуля",
          icon: BookOpen,
          run: () => {
            setOpen(false);
            router.push(`/dashboard/course/${moduleId}/lesson`);
          },
        },
        {
          id: "mod-test",
          label: "Тест модуля",
          icon: TestTube2,
          run: () => {
            setOpen(false);
            router.push(`/dashboard/course/${moduleId}/test`);
          },
        },
        {
          id: "mod-practice",
          label: "Практика модуля",
          icon: FlaskConical,
          run: () => {
            setOpen(false);
            router.push(`/dashboard/course/${moduleId}/practice`);
          },
        },
      );
    }

    return [...nav, ...extra];
  }, [isAuthenticated, isAdmin, moduleId, resolved, router, setTheme]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAuthenticated]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.keywords?.toLowerCase().includes(q),
    );
  }, [query, items]);

  React.useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setActiveIndex(0));
  }, [open, query, filtered.length]);

  React.useEffect(() => {
    if (!open || filtered.length === 0) return;
    const active = listRef.current?.querySelector<HTMLElement>(`[data-palette-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, filtered.length]);

  function runActive() {
    filtered[activeIndex]?.run();
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      runActive();
    }
  }

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((v) => !v),
    }),
    [open],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {isAuthenticated ? (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-background/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
            <Dialog.Content
              className={cn(
                "fixed left-1/2 top-[12%] z-(--z-modal) w-[min(100vw-2rem,34rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-modal",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "motion-reduce:transition-none motion-reduce:animate-none",
                focusRing,
              )}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Dialog.Title className="sr-only">Командная палитра</Dialog.Title>
              <Dialog.Description className="sr-only">Поиск по разделам и действиям</Dialog.Description>
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search className="size-4 text-muted-foreground" aria-hidden />
                <label htmlFor="command-palette-search" className="sr-only">
                  Поиск команд
                </label>
                <input
                  id="command-palette-search"
                  type="search"
                  role="combobox"
                  aria-expanded={filtered.length > 0}
                  aria-controls="command-palette-listbox"
                  aria-activedescendant={
                    filtered.length > 0 ? `command-palette-option-${activeIndex}` : undefined
                  }
                  data-testid="command-palette-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Кабинет, курс, наставник…"
                  className="min-w-0 flex-1 rounded-md bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
              </div>
              <ul
                ref={listRef}
                id="command-palette-listbox"
                role="listbox"
                className="max-h-80 overflow-y-auto p-2"
                aria-label="Результаты"
              >
                {filtered.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground" role="presentation">
                    Ничего не найдено
                  </li>
                ) : (
                  filtered.map((item, index) => {
                    const Icon = item.icon;
                    const selected = index === activeIndex;
                    return (
                      <li key={item.id} role="presentation">
                        <button
                          type="button"
                          id={`command-palette-option-${index}`}
                          data-palette-index={index}
                          role="option"
                          aria-selected={selected}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                            selected ? "bg-primary/12 ring-1 ring-primary/20" : "hover:bg-muted/50",
                            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={item.run}
                        >
                          <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="font-medium text-foreground">{item.label}</span>
                            {item.description ? (
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <p className="border-t border-border px-4 py-2 text-2.75 text-muted-foreground">
                <Link href="/dashboard/course" className="text-primary hover:underline" onClick={() => setOpen(false)}>
                  Курс
                </Link>
                {" · "}⌘K / Ctrl+K · ↑↓ · Enter
              </p>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}
    </CommandPaletteContext.Provider>
  );
}

export function CommandPaletteTrigger({
  className,
  showLabel = false,
  onActivate,
}: {
  className?: string;
  /** Always show «Команды» (mobile drawer, wide toolbar). */
  showLabel?: boolean;
  onActivate?: () => void;
}) {
  const { open, toggle } = useCommandPalette();

  return (
    <button
      type="button"
      data-testid="command-palette-trigger"
      className={cn(
        "ce-floating-nav-cmd shrink-0",
        !showLabel && "ce-floating-nav-cmd--compact max-xl:px-2.5",
        className,
      )}
      aria-label="Командная палитра (Ctrl+K)"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => {
        toggle();
        onActivate?.();
      }}
    >
      <Command className="size-4 shrink-0" aria-hidden />
      <span className={cn(showLabel ? "inline" : "hidden sm:inline xl:hidden")}>Команды</span>
      <kbd className="hidden xl:inline">⌘K</kbd>
    </button>
  );
}
