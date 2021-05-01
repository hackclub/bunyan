/*
  Warnings:

  - You are about to drop the column `thread_ts` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "thread_ts",
ADD COLUMN     "event_ts" DECIMAL(65,30) NOT NULL DEFAULT 0;
