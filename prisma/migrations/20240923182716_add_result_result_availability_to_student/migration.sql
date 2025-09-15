/*
  Warnings:

  - You are about to drop the column `resultAvailabilty` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "resultAvailabilty",
ADD COLUMN     "resultAvailability" BOOLEAN NOT NULL DEFAULT false;
