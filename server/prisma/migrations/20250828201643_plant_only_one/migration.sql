/*
  Warnings:

  - You are about to drop the `DiaryPlant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DiaryPlant` DROP FOREIGN KEY `DiaryPlant_diary_id_fkey`;

-- DropForeignKey
ALTER TABLE `DiaryPlant` DROP FOREIGN KEY `DiaryPlant_plant_id_fkey`;

-- AlterTable
ALTER TABLE `Diary` ADD COLUMN `plant_id` INTEGER NULL;

-- DropTable
DROP TABLE `DiaryPlant`;

-- AddForeignKey
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_plant_id_fkey` FOREIGN KEY (`plant_id`) REFERENCES `Plant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
