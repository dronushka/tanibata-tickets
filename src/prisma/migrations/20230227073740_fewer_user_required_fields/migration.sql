/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `nickname` VARCHAR(191) NULL,
    MODIFY `age` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Role_name_key` ON `Role`(`name`);
