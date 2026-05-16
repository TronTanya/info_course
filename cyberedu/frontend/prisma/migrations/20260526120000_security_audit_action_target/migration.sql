-- SecurityAuditLog: action + targetId для структурированного аудита
ALTER TABLE "security_audit_log" ADD COLUMN IF NOT EXISTS "action" TEXT;
ALTER TABLE "security_audit_log" ADD COLUMN IF NOT EXISTS "targetId" TEXT;

UPDATE "security_audit_log" SET "action" = "event" WHERE "action" IS NULL;

ALTER TABLE "security_audit_log" ALTER COLUMN "action" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "security_audit_log_action_idx" ON "security_audit_log"("action");
CREATE INDEX IF NOT EXISTS "security_audit_log_targetId_idx" ON "security_audit_log"("targetId");
