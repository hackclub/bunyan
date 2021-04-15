/*
  Warnings:

  - The primary key for the `MovingAverage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `modified` on the `MovingAverage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovingAverage" DROP CONSTRAINT "MovingAverage_pkey",
DROP COLUMN "modified",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "MovingAverage.slack_id_index" ON "MovingAverage"("slack_id");
