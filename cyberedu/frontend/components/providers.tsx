"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { CommandPaletteProvider } from "@/components/layout/command-palette-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <CommandPaletteProvider>
              <PageTransition>{children}</PageTransition>
            </CommandPaletteProvider>
          </SessionProvider>
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
