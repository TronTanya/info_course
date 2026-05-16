-- Новые типы практик и JSON-сценарии (учебные, без исполняемого кода).

ALTER TYPE "PracticalTaskType" ADD VALUE 'SITUATION_CHOICE';
ALTER TYPE "PracticalTaskType" ADD VALUE 'PASSWORD_ANALYSIS';
ALTER TYPE "PracticalTaskType" ADD VALUE 'PHISHING_ANALYSIS';
ALTER TYPE "PracticalTaskType" ADD VALUE 'CHECKLIST';
ALTER TYPE "PracticalTaskType" ADD VALUE 'URL_ANALYSIS';
ALTER TYPE "PracticalTaskType" ADD VALUE 'TRAINING_CONSOLE';
ALTER TYPE "PracticalTaskType" ADD VALUE 'CRYPTO_TASK';
ALTER TYPE "PracticalTaskType" ADD VALUE 'LOG_ANALYSIS';

ALTER TABLE "PracticalTask" ADD COLUMN "scenarioData" JSONB;
