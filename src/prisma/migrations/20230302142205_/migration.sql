/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Order_fileId_key` ON `Order`(`fileId`);
