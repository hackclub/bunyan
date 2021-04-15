/*
  Warnings:

  - You are about to drop the column `watching` on the `MovingAverage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MovingAverage.slack_id_index";

-- AlterTable
ALTER TABLE "MovingAverage" DROP COLUMN "watching",
ADD COLUMN     "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SlackResource" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watching" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovingAverage" ADD FOREIGN KEY ("slack_id") REFERENCES "SlackResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
