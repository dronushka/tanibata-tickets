/*
  Warnings:

  - Made the column `ticketCount` on table `Venue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Venue` MODIFY `ticketCount` INTEGER NOT NULL;
