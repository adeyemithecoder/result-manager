/*
  Warnings:

  - You are about to drop the column `termBegins` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `termEnds` on the `School` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "School" DROP COLUMN "termBegins",
DROP COLUMN "termEnds";

-- AlterTable
ALTER TABLE "TermDate" ADD COLUMN     "termBegins" TEXT,
ADD COLUMN     "termEnds" TEXT,
ALTER COLUMN "nextTermBegin" DROP NOT NULL;
