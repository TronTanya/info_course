"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteModuleAction } from "@/lib/actions/admin-modules";
import { Button } from "@/components/ui/button";

export function AdminModuleDeleteButton({
  moduleId,
  disabled,
}: {
  moduleId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={disabled || pending}
      loading={pending}
      onClick={() => {
        if (disabled) return;
        if (!window.confirm("Удалить модуль? Будут удалены связанные лекции, тесты и задания (если нет прогресса пользователей).")) {
          return;
        }
        startTransition(async () => {
          const r = await deleteModuleAction(moduleId);
          if (r.error) {
            window.alert(r.error);
            return;
          }
          router.push("/admin/modules");
          router.refresh();
        });
      }}
    >
      Удалить
    </Button>
  );
}
