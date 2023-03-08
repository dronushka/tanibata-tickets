/*
  Warnings:

  - You are about to drop the column `noPlaces` on the `Venue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Venue` DROP COLUMN `noPlaces`,
    ADD COLUMN `ticketCount` INTEGER NULL;
