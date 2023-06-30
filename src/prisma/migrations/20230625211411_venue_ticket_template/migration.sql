/*
  Warnings:

  - You are about to drop the column `priceRangeTemplateId` on the `PriceRange` table. All the data in the column will be lost.
  - You are about to drop the `PriceRangeTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PriceRange` DROP FOREIGN KEY `PriceRange_priceRangeTemplateId_fkey`;

-- AlterTable
ALTER TABLE `PriceRange` DROP COLUMN `priceRangeTemplateId`;

-- AlterTable
ALTER TABLE `Venue` ADD COLUMN `ticketTemplateId` INTEGER NULL;

-- DropTable
DROP TABLE `PriceRangeTemplate`;

-- CreateTable
CREATE TABLE `TicketTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mailMessage` TEXT NULL,
    `premiumTicketMessage` TEXT NULL,
    `ticketTemplate` VARCHAR(191) NULL,
    `premiumTicketTemplate` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Venue` ADD CONSTRAINT `Venue_ticketTemplateId_fkey` FOREIGN KEY (`ticketTemplateId`) REFERENCES `TicketTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
