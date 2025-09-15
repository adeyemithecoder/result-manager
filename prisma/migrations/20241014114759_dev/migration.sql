/*
  Warnings:

  - You are about to drop the column `score` on the `StudentTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentTask" DROP COLUMN "score",
ADD COLUMN     "scores" TEXT[] DEFAULT ARRAY[]::TEXT[];
