-- Server-side AI tutor chat history (trusted assistant turns only from server).

CREATE TABLE "tutor_chat_thread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_chat_thread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tutor_chat_message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_chat_message_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tutor_chat_thread_userId_scopeKey_key" ON "tutor_chat_thread"("userId", "scopeKey");
CREATE INDEX "tutor_chat_thread_userId_idx" ON "tutor_chat_thread"("userId");
CREATE INDEX "tutor_chat_message_threadId_createdAt_idx" ON "tutor_chat_message"("threadId", "createdAt");

ALTER TABLE "tutor_chat_thread" ADD CONSTRAINT "tutor_chat_thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tutor_chat_message" ADD CONSTRAINT "tutor_chat_message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "tutor_chat_thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
