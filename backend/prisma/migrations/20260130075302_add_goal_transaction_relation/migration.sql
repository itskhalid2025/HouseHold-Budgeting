/*
  Warnings:

  - Made the column `target_amount` on table `goals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "goals" ALTER COLUMN "target_amount" SET NOT NULL;
