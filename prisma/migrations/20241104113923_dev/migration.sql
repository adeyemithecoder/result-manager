/*
  Warnings:

  - You are about to drop the column `resultAvailability` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "resultAvailability";

-- CreateTable
CREATE TABLE "ResultAvailability" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "termType" "TermType" NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResultAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResultAvailability_studentId_termType_key" ON "ResultAvailability"("studentId", "termType");

-- CreateIndex
CREATE INDEX "Student_schoolId_idx" ON "Student"("schoolId");

-- AddForeignKey
ALTER TABLE "ResultAvailability" ADD CONSTRAINT "ResultAvailability_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
