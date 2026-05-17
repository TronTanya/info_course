"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Command,
  FlaskConical,
  GraduationCap,
  Moon,
  Search,
  Sun,
  TestTube2,
} from "lucide-react";
import { commandPaletteActions } from "@/lib/design-system/nav-config";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

type PaletteItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  keywords?: string;
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { resolved, setTheme } = useTheme();

  const moduleMatch = pathname.match(/\/dashboard\/course\/([^/]+)/);
  const moduleId = moduleMatch?.[1];

  const items = React.useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = commandPaletteActions.map((a) => ({
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
        id: "theme",
        label: resolved === "dark" ? "Светлая тема" : "Тёмная тема",
        description: "Переключить оформление интерфейса",
        icon: resolved === "dark" ? Sun : Moon,
        run: () => {
          setTheme(resolved === "dark" ? "light" : "dark");
          setOpen(false);
        },
        keywords: "theme dark light",
      },
    ];

    if (moduleId) {
      extra.push(
        {
          id: "mod-hub",
          label: "Хаб модуля",
          description: "Шаги текущего модуля",
          icon: GraduationCap,
          run: () => {
            setOpen(false);
            router.push(`/dashboard/course/${moduleId}`);
          },
        },
        {
          id: "mod-lesson",
          label: "Лекция модуля",
          icon: GraduationCap,
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

    extra.push({
      id: "ai-hint",
      label: "AI-наставник",
      description: "Откройте плавающую кнопку в правом нижнем углу",
      icon: Bot,
      run: () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("cyberedu:open-mentor"));
      },
      keywords: "mentor chat ai",
    });

    return [...nav, ...extra];
  }, [moduleId, resolved, router, setTheme]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        data-testid="command-palette-trigger"
        className="inline-flex size-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:border-primary/25 hover:text-foreground md:h-auto md:min-h-0 md:w-auto md:px-3 md:py-2 md:text-sm"
        aria-label="Командная палитра (Ctrl+K)"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Command className="size-4" aria-hidden />
        <span className="hidden lg:inline">Команды</span>
        <kbd className="ml-1 hidden rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] lg:inline">
          ⌘K
        </kbd>
      </button>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[12%] z-50 w-[min(100vw-2rem,32rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-glow)",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "motion-reduce:transition-none motion-reduce:animate-none",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">Командная палитра</Dialog.Title>
          <Dialog.Description className="sr-only">Поиск по разделам курса и действиям</Dialog.Description>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              data-testid="command-palette-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Раздел, модуль, тема…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Ничего не найдено</li>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        "hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                      onClick={item.run}
                    >
                      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-foreground">{item.label}</span>
                        {item.description ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <Link href="/dashboard/course" className="text-primary hover:underline" onClick={() => setOpen(false)}>
              Курс
            </Link>
            {" · "}Enter — действие · Esc — закрыть
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
