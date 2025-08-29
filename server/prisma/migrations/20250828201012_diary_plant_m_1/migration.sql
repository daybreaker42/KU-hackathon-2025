/*
  Warnings:

  - You are about to drop the column `plant_id` on the `Diary` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Diary` DROP FOREIGN KEY `Diary_plant_id_fkey`;

-- DropIndex
DROP INDEX `Diary_plant_id_fkey` ON `Diary`;

-- AlterTable
ALTER TABLE `Diary` DROP COLUMN `plant_id`;

-- CreateTable
CREATE TABLE `DiaryPlant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diary_id` INTEGER NOT NULL,
    `plant_id` INTEGER NOT NULL,
    `sunlight` VARCHAR(191) NULL,
    `water` VARCHAR(191) NULL,

    UNIQUE INDEX `DiaryPlant_diary_id_plant_id_key`(`diary_id`, `plant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DiaryPlant` ADD CONSTRAINT `DiaryPlant_diary_id_fkey` FOREIGN KEY (`diary_id`) REFERENCES `Diary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiaryPlant` ADD CONSTRAINT `DiaryPlant_plant_id_fkey` FOREIGN KEY (`plant_id`) REFERENCES `Plant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
