/*
  Warnings:

  - Changed the type of `content_length` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content_length",
ADD COLUMN     "content_length" INTEGER NOT NULL;
