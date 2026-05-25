"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminLiveRegion } from "@/components/admin/admin-live-region";
import { AdminActionError } from "@/components/admin/admin-states";
import { deleteModuleAction } from "@/lib/actions/admin-modules";
import { sanitizeAdminActionError } from "@/lib/admin-ui-states";
import { Button } from "@/components/ui/button";

export function AdminModuleDeleteButton({
  moduleId,
  disabled,
}: {
  moduleId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <AdminLiveRegion message={error ? "Не удалось удалить модуль." : null} politeness="assertive" />
      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={disabled || pending}
        onClick={() => {
          if (disabled) return;
          setError(null);
          setOpen(true);
        }}
      >
        Удалить
      </Button>
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Удалить модуль?"
        description="Будут удалены связанные лекции, тесты и задания, если нет прогресса пользователей по этому модулю."
        confirmLabel="Удалить модуль"
        loading={pending}
        onConfirm={() => {
          startTransition(async () => {
            const r = await deleteModuleAction(moduleId);
            if (r.error) {
              setError(sanitizeAdminActionError(r.error));
              return;
            }
            setOpen(false);
            router.push("/admin/modules");
            router.refresh();
          });
        }}
      />
      {error ? <AdminActionError message={error} /> : null}
    </>
  );
}
