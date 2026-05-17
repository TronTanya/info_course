"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
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
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
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
              setError(r.error);
              return;
            }
            setOpen(false);
            router.push("/admin/modules");
            router.refresh();
          });
        }}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </>
  );
}
