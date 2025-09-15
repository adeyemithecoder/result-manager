/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Term` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Term` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Term" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
