/*
  Warnings:

  - A unique constraint covering the columns `[name,schoolId]` on the table `FeeItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeeItem_name_schoolId_key" ON "FeeItem"("name", "schoolId");
