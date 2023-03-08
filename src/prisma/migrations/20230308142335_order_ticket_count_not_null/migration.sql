/*
  Warnings:

  - Made the column `ticketCount` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `ticketCount` INTEGER NOT NULL;
