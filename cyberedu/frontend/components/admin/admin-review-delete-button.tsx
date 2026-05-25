"use client";

import { useState, useTransition } from "react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { deleteReviewAction } from "@/lib/actions/admin-reviews";
import { Button } from "@/components/ui/button";

export function AdminReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        className="w-full"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Удалить
      </Button>
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Удалить отзыв?"
        description="Отзыв будет удалён из базы без возможности восстановления через интерфейс."
        confirmLabel="Удалить отзыв"
        loading={pending}
        onConfirm={() => {
          startTransition(async () => {
            await deleteReviewAction(reviewId, new FormData());
            setOpen(false);
          });
        }}
      />
    </>
  );
}
