/*
  Warnings:

  - The `scores` column on the `StudentTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "StudentTask" DROP COLUMN "scores",
ADD COLUMN     "scores" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
