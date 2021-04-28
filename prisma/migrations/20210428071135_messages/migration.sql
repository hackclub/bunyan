-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "content_length" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message.user_id_index" ON "Message"("user_id");

-- CreateIndex
CREATE INDEX "Message.channel_id_index" ON "Message"("channel_id");

-- CreateIndex
CREATE INDEX "Message.user_id_channel_id_index" ON "Message"("user_id", "channel_id");

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
