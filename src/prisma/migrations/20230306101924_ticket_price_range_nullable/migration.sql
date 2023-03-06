-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_priceRangeId_fkey`;

-- AlterTable
ALTER TABLE `Ticket` MODIFY `priceRangeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_priceRangeId_fkey` FOREIGN KEY (`priceRangeId`) REFERENCES `PriceRange`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
