-- CreateTable
CREATE TABLE "SlackResource" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watching" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SlackResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingAverage" (
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "average" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "variance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deviation" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "forecast" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "slack_id" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MovingAverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watching" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watching" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emoji" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watching" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Emoji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emoji_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "ts" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "event_ts" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "content_length" INTEGER NOT NULL,
    "thread_ts" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ts" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovingAverage.created_index" ON "MovingAverage"("created");

-- CreateIndex
CREATE INDEX "MovingAverage.slack_id_messages_index" ON "MovingAverage"("slack_id", "messages");

-- CreateIndex
CREATE INDEX "MovingAverage.slack_id_index" ON "MovingAverage"("slack_id");

-- CreateIndex
CREATE INDEX "Reaction.channel_id_index" ON "Reaction"("channel_id");

-- CreateIndex
CREATE INDEX "Reaction.emoji_id_channel_id_index" ON "Reaction"("emoji_id", "channel_id");

-- CreateIndex
CREATE INDEX "Reaction.user_id_channel_id_index" ON "Reaction"("user_id", "channel_id");

-- CreateIndex
CREATE INDEX "Message.user_id_index" ON "Message"("user_id");

-- CreateIndex
CREATE INDEX "Message.channel_id_user_id_index" ON "Message"("channel_id", "user_id");

-- AddForeignKey
ALTER TABLE "MovingAverage" ADD CONSTRAINT "MovingAverage_slack_id_fkey" FOREIGN KEY ("slack_id") REFERENCES "SlackResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_emoji_id_fkey" FOREIGN KEY ("emoji_id") REFERENCES "Emoji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
