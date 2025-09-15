/*
  Warnings:

  - You are about to drop the column `customLabel` on the `Assignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "customLabel",
ADD COLUMN     "scores" TEXT[] DEFAULT ARRAY[]::TEXT[];
