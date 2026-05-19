import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata = buildPublicMetadata({
  title: "Сброс пароля",
  description: "Запросите ссылку для восстановления доступа к CyberEdu.",
  path: "/auth/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingState size="sm" label="Загрузка…" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
