/*
  Warnings:

  - Added the required column `priceRangeId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `priceRangeId` INTEGER NOT NULL,
    ADD COLUMN `reserved` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `PriceRange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_priceRangeId_fkey` FOREIGN KEY (`priceRangeId`) REFERENCES `PriceRange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
