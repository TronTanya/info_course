"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const REDIRECT_DELAY_MS = 1200;
const SESSION_REFRESH_MS = 4000;

type Props = {
  callbackUrl: string;
  enabled: boolean;
};

async function refreshSessionWithTimeout(
  update: () => Promise<unknown>,
): Promise<void> {
  await Promise.race([
    update(),
    new Promise<void>((resolve) => window.setTimeout(resolve, SESSION_REFRESH_MS)),
  ]).catch(() => undefined);
}

/**
 * После успешного verify обновляет JWT (trigger=update) и уводит в callbackUrl.
 */
export function VerifyEmailAutoRedirect({ callbackUrl, enabled }: Props) {
  const { update } = useSession();
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;

    const timer = window.setTimeout(() => {
      void (async () => {
        await refreshSessionWithTimeout(update);
        window.location.assign(callbackUrl);
      })();
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [callbackUrl, enabled, update]);

  if (!enabled) return null;

  return (
    <p className="text-center text-sm text-muted-foreground" role="status">
      Перенаправляем в личный кабинет…
    </p>
  );
}
