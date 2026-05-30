"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Zap } from "lucide-react";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 480;

export function LandingStickyCta() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard/course";
  const primaryHref = isAuthenticated ? dashboardHref : guestAuthLinks.cabinetLogin;
  const primaryLabel = isAuthenticated ? "Продолжить" : guestAuthLinks.cabinetLabel;

  if (!visible) return null;

  return (
    <div
      className={cn(
        "ce-landing-sticky-cta pointer-events-none fixed inset-x-0 bottom-0 z-[calc(var(--z-sticky)+2)]",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2",
        "lg:hidden",
      )}
      role="region"
      aria-label="Быстрое действие"
    >
      <div className="container-page pointer-events-auto">
        <div className="ce-landing-sticky-cta__panel flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-modal backdrop-blur-md">
          <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
            <span className="block font-semibold text-foreground">CyberEdu</span>
            SOC-лабы и AI-наставник
          </p>
          <Button asChild size="sm" className="shrink-0 gap-1.5 rounded-xl px-4" disabled={status === "loading"}>
            <a href={status === "loading" ? "#start" : primaryHref}>
              <Zap className="size-3.5" aria-hidden />
              {status === "loading" ? "…" : primaryLabel}
              {status !== "loading" ? <ArrowRight className="size-3.5 opacity-80" aria-hidden /> : null}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
