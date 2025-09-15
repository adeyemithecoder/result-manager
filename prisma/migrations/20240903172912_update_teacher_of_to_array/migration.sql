/*
  Warnings:

  - The `teacherOf` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "teacherOf",
ADD COLUMN     "teacherOf" TEXT[] DEFAULT ARRAY[]::TEXT[];
