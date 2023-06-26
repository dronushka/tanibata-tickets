-- AlterTable
ALTER TABLE `PriceRange` ADD COLUMN `mail` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `templateFileId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PriceRange` ADD CONSTRAINT `PriceRange_templateFileId_fkey` FOREIGN KEY (`templateFileId`) REFERENCES `File`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
