"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CoursePageRetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="primary"
      disabled={pending}
      className="gap-2"
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
      {pending ? "Обновление…" : "Повторить попытку"}
    </Button>
  );
}
