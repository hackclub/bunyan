import { GenericMessageEvent } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app, { prisma, io } from './server'
import sha1 from 'sha1'


app.message(/./, async ({ message, say, client, logger }) => {
  if ('user' in message && message.user !== undefined) { // Not all messages have a user FIXME
    try {
      const _message = message as GenericMessageEvent
      const thread_ts = parseFloat(_message.thread_ts || _message.ts) || 0
      const ts = _message.ts
      const m = message, _m = _message
      setTimeout(async () => {
        const { channel } = await client.conversations.info({channel: message.channel})
        const { user } = await client.users.info({user: message.user || ''})
        logger.info(`!! ${(user as any).profile.display_name || '_'}@${(channel as any).name} ${m.user}@${m.channel}/${thread_ts}/${_m.ts}`)
      }, 0)

      const text = message && message.text || ''
      const length = message && message.text && message.text.length || 0
      const message$ = await prisma.message.create({
        data: {
          thread_ts, ts,
          content_hash: sha1(text),
          content_length: length,
          user: {
            connectOrCreate: {
              create: {id: message.user},
              where:  {id: message.user},
            },
          },
          channel: {
            connectOrCreate: {
              create: {id: message.channel},
              where:  {id: message.channel},
            },
          },
        },
      })

      io.emit("messages", { message: message$, })

    } catch (e) {
      logger.error(e)
    }
  }
})
