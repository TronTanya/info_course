import type { ReactNode } from "react";

/** Одна колонка по центру — без marketing-панели справа. */
export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ce-auth-split mx-auto flex w-full min-w-0 flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="w-full min-w-0">{children}</div>
    </div>
  );
}
