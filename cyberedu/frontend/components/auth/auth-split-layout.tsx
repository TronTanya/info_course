import type { ReactNode } from "react";
import { AuthBrandStrip } from "@/components/auth/auth-brand-strip";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ce-auth-split mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-none lg:flex-row lg:gap-0 lg:px-0 lg:py-0">
      <div className="ce-auth-split-form flex w-full min-w-0 flex-col justify-center gap-6 lg:max-w-xl lg:flex-1 lg:px-8 lg:py-12 xl:max-w-lg xl:px-12 xl:py-16 2xl:max-w-xl">
        <AuthBrandStrip />
        <div className="w-full min-w-0">{children}</div>
      </div>
      <AuthVisualPanel className="lg:flex-1" />
    </div>
  );
}
