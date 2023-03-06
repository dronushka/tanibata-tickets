-- AlterTable
ALTER TABLE `Ticket` MODIFY `rowNumber` VARCHAR(191) NULL,
    MODIFY `sortRowNumber` INTEGER NULL DEFAULT 0;
