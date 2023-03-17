-- AlterTable
ALTER TABLE `Order` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE `File` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
