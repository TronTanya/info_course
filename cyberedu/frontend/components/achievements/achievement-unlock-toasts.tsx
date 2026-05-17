"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";

export type AchievementUnlockNotice = {
  kind: string;
  title: string;
  description: string;
};

export function AchievementUnlockToasts({ unlocks }: { unlocks: AchievementUnlockNotice[] }) {
  const { toast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || unlocks.length === 0) return;
    shown.current = true;
    unlocks.forEach((u, index) => {
      window.setTimeout(() => {
        toast({
          title: `Достижение: ${u.title}`,
          description: u.description,
          variant: "success",
          duration: 7000,
        });
      }, index * 450);
    });
  }, [unlocks, toast]);

  return null;
}
