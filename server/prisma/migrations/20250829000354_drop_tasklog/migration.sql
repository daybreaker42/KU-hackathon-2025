/*
  Warnings:

  - You are about to drop the `TaskLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TaskLog` DROP FOREIGN KEY `TaskLog_plant_id_fkey`;

-- DropTable
DROP TABLE `TaskLog`;
