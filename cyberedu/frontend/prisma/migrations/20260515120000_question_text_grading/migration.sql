-- AlterTable
ALTER TABLE "Question" ADD COLUMN "textExpectedAnswer" TEXT,
ADD COLUMN "textManualGrading" BOOLEAN NOT NULL DEFAULT false;
