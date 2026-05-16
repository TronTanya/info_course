-- AlterTable
ALTER TABLE "PracticalTask" ADD COLUMN "consoleScenario" TEXT,
ADD COLUMN "allowedFileTypes" TEXT,
ADD COLUMN "maxFileSizeMb" INTEGER,
ADD COLUMN "minLength" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "instruction" TEXT;
