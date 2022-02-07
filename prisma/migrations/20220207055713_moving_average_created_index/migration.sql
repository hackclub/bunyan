-- DropIndex
DROP INDEX "Message.user_id_channel_id_index";

-- DropIndex
DROP INDEX "Reaction.emoji_id_index";

-- DropIndex
DROP INDEX "Reaction.emoji_id_user_id_index";

-- CreateIndex
CREATE INDEX "Message.channel_id_user_id_index" ON "Message"("channel_id", "user_id");

-- CreateIndex
CREATE INDEX "Reaction.user_id_channel_id_index" ON "Reaction"("user_id", "channel_id");
