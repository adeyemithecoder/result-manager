/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Assignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "createdAt",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "variant" TEXT,
ALTER COLUMN "level" DROP DEFAULT;

-- DropEnum
DROP TYPE "AssignmentType";
