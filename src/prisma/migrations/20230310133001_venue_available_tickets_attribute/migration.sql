/*
  Warnings:

  - Added the required column `availableTickets` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Venue` ADD COLUMN `availableTickets` INTEGER NOT NULL;
