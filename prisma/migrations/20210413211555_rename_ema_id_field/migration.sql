/*
  Warnings:

  - The primary key for the `MovingAverage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MovingAverage` table. All the data in the column will be lost.
  - Added the required column `slack_id` to the `MovingAverage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MovingAverage" DROP CONSTRAINT "MovingAverage_pkey",
DROP COLUMN "id",
ADD COLUMN     "slack_id" TEXT NOT NULL,
ADD PRIMARY KEY ("slack_id");
