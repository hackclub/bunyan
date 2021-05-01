/*
  Warnings:

  - The `ts` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "ts",
ADD COLUMN     "ts" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "ts" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "thread_ts" DECIMAL(65,30) NOT NULL DEFAULT 0;
