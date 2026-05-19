import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata = buildPublicMetadata({
  title: "Новый пароль",
  description: "Установите новый пароль для аккаунта CyberEdu.",
  path: "/auth/reset-password",
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState size="sm" label="Загрузка…" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
