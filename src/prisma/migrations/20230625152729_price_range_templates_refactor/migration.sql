/*
  Warnings:

  - You are about to drop the column `mail` on the `PriceRange` table. All the data in the column will be lost.
  - You are about to drop the column `templateFileId` on the `PriceRange` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `PriceRange` DROP FOREIGN KEY `PriceRange_templateFileId_fkey`;

-- AlterTable
ALTER TABLE `PriceRange` DROP COLUMN `mail`,
    DROP COLUMN `templateFileId`,
    ADD COLUMN `priceRangeTemplateId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PriceRangeTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mailMessage` VARCHAR(191) NULL,
    `premiumTicketMessage` VARCHAR(191) NULL,
    `ticketTemplate` VARCHAR(191) NULL,
    `premiumTicketTemplate` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PriceRange` ADD CONSTRAINT `PriceRange_priceRangeTemplateId_fkey` FOREIGN KEY (`priceRangeTemplateId`) REFERENCES `PriceRangeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
