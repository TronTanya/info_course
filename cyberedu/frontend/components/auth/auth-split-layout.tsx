import type { ReactNode } from "react";
import { AuthValueAside, AuthValueMobile } from "@/components/auth/auth-value-aside";

/** Форма + value panel на desktop (lg+). */
export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ce-auth-split-wrap mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col justify-center gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:items-start lg:gap-16 lg:py-16 xl:max-w-6xl">
      <AuthValueAside />
      <div className="ce-auth-split w-full min-w-0 shrink-0 lg:max-w-md">
        <AuthValueMobile />
        {children}
      </div>
    </div>
  );
}
