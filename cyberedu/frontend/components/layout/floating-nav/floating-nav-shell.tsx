"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FloatingNavShellProps = {
  children: React.ReactNode;
  /** More transparent at top of page (marketing hero) */
  transparentAtTop?: boolean;
  className?: string;
};

export function FloatingNavShell({ children, transparentAtTop = false, className }: FloatingNavShellProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const atTop = transparentAtTop && !scrolled;

  return (
    <>
      <div className="ce-floating-nav-anchor" role="presentation">
        <header
          className={cn(
            "ce-floating-nav",
            scrolled && "ce-floating-nav--scrolled",
            atTop && "ce-floating-nav--transparent",
            className,
          )}
        >
          <div className="ce-floating-nav__inner">{children}</div>
        </header>
      </div>
      <div className="ce-floating-nav-spacer" aria-hidden />
    </>
  );
}
