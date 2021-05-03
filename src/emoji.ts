import { prisma } from "./server";
import { name } from 'emoji-name-map'

prisma.$use(async (params, next) => {
  if (params.model == 'Emoji' && params) {
    console.log(params)
  }
  const result = await next(params)
  return result
})

const getEmojiSource = async (emoji: string) => {
  const emojiRequest = await fetch('https://badger-kda1flk8c.hackclub.dev/emoji').then(r => r.json())
  let source
  if (emojiRequest[emoji]) {
    // this is a custom emoji in slack, let's save the URL
    source = emojiRequest[emoji]
  } else {
    // not found in the slack emoji api, let's assume it's unicode
    source = name.get(emoji)
  }

  return source
}