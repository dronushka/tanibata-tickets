-- AlterTable
ALTER TABLE `PriceRange` ADD COLUMN `venueId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PriceRange` ADD CONSTRAINT `PriceRange_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `Venue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
