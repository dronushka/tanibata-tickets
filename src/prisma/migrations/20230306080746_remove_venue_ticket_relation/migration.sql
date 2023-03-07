/*
  Warnings:

  - You are about to drop the column `venueId` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_venueId_fkey`;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `venueId`;
