/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - The primary key for the `PaymentItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `iid` on the `PaymentItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,termType]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `PaymentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `PaymentItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount",
DROP COLUMN "date",
DROP COLUMN "method";

-- AlterTable
ALTER TABLE "PaymentItem" DROP CONSTRAINT "PaymentItem_pkey",
DROP COLUMN "iid",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "method" TEXT NOT NULL,
ADD CONSTRAINT "PaymentItem_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_studentId_termType_key" ON "Payment"("studentId", "termType");
