"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0", className)}
      aria-label={resolved === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      title={resolved === "dark" ? "Светлая тема" : "Тёмная тема"}
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
    >
      {resolved === "dark" ? <Sun className="size-[1.15rem]" aria-hidden /> : <Moon className="size-[1.15rem]" aria-hidden />}
    </Button>
  );
}
