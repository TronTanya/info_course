"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "ce-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function resolveDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let stored: Theme = "system";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") stored = raw;
    } catch {
      /* ignore */
    }
    setThemeState(stored);
    const dark = resolveDark(stored);
    applyTheme(dark);
    setResolved(dark ? "dark" : "light");
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const dark = resolveDark(theme);
    applyTheme(dark);
    setResolved(dark ? "dark" : "light");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, mounted]);

  React.useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const dark = mq.matches;
      applyTheme(dark);
      setResolved(dark ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, mounted]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme, resolved }), [theme, setTheme, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
