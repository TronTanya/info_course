"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CockpitLayout({
  children,
  aiPanel,
  className,
}: {
  children: ReactNode;
  aiPanel?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ce-cockpit min-w-0", className)}>
      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(260px,20rem)] xl:gap-10">
        <div className="ce-cockpit-grid ce-cockpit-grid--bento min-w-0">{children}</div>
        {aiPanel ? <aside className="hidden min-w-0 xl:block">{aiPanel}</aside> : null}
      </div>
    </div>
  );
}
