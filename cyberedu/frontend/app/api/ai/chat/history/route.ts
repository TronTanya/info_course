import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildTutorScopeKey,
  clearTrustedChatHistory,
  loadMentorChatHistoryForDisplay,
} from "@/lib/ai/tutor/context/chat-history-store";
import { withAuthApiRoute } from "@/lib/security/api-guard";

const historyQuerySchema = z.object({
  moduleId: z.string().min(1).optional(),
  lessonId: z.string().min(1).optional(),
  practicalTaskId: z.string().min(1).optional(),
});

function parseHistoryQuery(req: Request): z.infer<typeof historyQuerySchema> {
  const url = new URL(req.url);
  return historyQuerySchema.parse({
    moduleId: url.searchParams.get("moduleId") ?? undefined,
    lessonId: url.searchParams.get("lessonId") ?? undefined,
    practicalTaskId: url.searchParams.get("practicalTaskId") ?? undefined,
  });
}

export const GET = withAuthApiRoute(
  { rateLimit: "aiChat" },
  async ({ userId, req }) => {
    const query = parseHistoryQuery(req);
    const scopeKey = buildTutorScopeKey(query);
    const messages = await loadMentorChatHistoryForDisplay(userId, scopeKey);
    return NextResponse.json({ messages });
  },
);

export const DELETE = withAuthApiRoute(
  { rateLimit: "aiChat" },
  async ({ userId, req }) => {
    const query = parseHistoryQuery(req);
    const scopeKey = buildTutorScopeKey(query);
    await clearTrustedChatHistory(userId, scopeKey);
    return NextResponse.json({ ok: true });
  },
);
