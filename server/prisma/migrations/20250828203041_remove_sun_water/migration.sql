/*
  Warnings:

  - You are about to drop the column `sun` on the `Diary` table. All the data in the column will be lost.
  - You are about to drop the column `water` on the `Diary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Diary` DROP COLUMN `sun`,
    DROP COLUMN `water`;
