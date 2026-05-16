"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moveModuleAction } from "@/lib/actions/admin-modules";
import { Button } from "@/components/ui/button";

export function AdminModuleMoveButtons({
  moduleId,
  canUp,
  canDown,
}: {
  moduleId: string;
  canUp: boolean;
  canDown: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(direction: "up" | "down") {
    startTransition(async () => {
      await moveModuleAction(moduleId, direction);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Выше"
        disabled={!canUp || pending}
        onClick={() => run("up")}
        aria-label="Переместить модуль выше"
      >
        ↑
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Ниже"
        disabled={!canDown || pending}
        onClick={() => run("down")}
        aria-label="Переместить модуль ниже"
      >
        ↓
      </Button>
    </div>
  );
}
