"use client";

import { submitTestAttemptAction } from "@/lib/actions/test";
import type { SubmitTestAttemptInput, SubmitTestState } from "@/lib/actions/test";
import { formatTestSubmitError } from "@/lib/ux/format-user-error";

/**
 * Единая точка отправки теста с клиента: Server Action, без API route.
 * Сеть / неожиданные исключения → понятное сообщение, состояние формы остаётся у вызывающего.
 */
export async function submitTestAttemptClient(
  input: SubmitTestAttemptInput,
): Promise<SubmitTestState> {
  try {
    return await submitTestAttemptAction(input);
  } catch (err) {
    return { ok: false, error: formatTestSubmitError(err) };
  }
}
