-- CreateTable
CREATE TABLE "security_audit_log" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "actorId" TEXT,
    "ip" TEXT,
    "path" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_audit_log_event_idx" ON "security_audit_log"("event");

-- CreateIndex
CREATE INDEX "security_audit_log_actorId_idx" ON "security_audit_log"("actorId");

-- CreateIndex
CREATE INDEX "security_audit_log_createdAt_idx" ON "security_audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "security_audit_log_severity_idx" ON "security_audit_log"("severity");
