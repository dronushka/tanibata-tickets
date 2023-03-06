/*
  Warnings:

  - You are about to drop the column `rowId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `Row` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rowNumber` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Row` DROP FOREIGN KEY `Row_venueId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_rowId_fkey`;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `rowId`,
    ADD COLUMN `rowNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `sortRowNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `venueId` INTEGER NULL;

-- DropTable
DROP TABLE `Row`;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `Venue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
