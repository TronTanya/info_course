"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("shrink-0", className)}
        aria-hidden
        tabIndex={-1}
        disabled
      >
        <span className="inline-block size-4.5" aria-hidden />
      </Button>
    );
  }

  const isDark = resolved === "dark";
  const label = isDark ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0", className)}
      aria-label={label}
      title={label}
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4.5 hidden dark:inline" aria-hidden />
      <Moon className="size-4.5 inline dark:hidden" aria-hidden />
    </Button>
  );
}
