/*
  Warnings:

  - The `submission` column on the `StudentTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "StudentTask" DROP COLUMN "submission",
ADD COLUMN     "submission" TEXT[];
