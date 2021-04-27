/*
  Warnings:

  - You are about to drop the column `updated` on the `MovingAverage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovingAverage" DROP COLUMN "updated",
ADD COLUMN     "messages" INTEGER NOT NULL DEFAULT 0;
