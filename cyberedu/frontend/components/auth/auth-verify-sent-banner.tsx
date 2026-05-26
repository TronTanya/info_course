import { FormMessage } from "@/components/ui/form-message";

/** Баннер после регистрации или повторной отправки письма подтверждения. */
export function AuthVerifySentBanner() {
  return (
    <FormMessage variant="success">
      Письмо с подтверждением отправлено. Проверьте входящие и папку «Спам».
    </FormMessage>
  );
}
