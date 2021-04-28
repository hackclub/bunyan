import { GenericMessageEvent } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app, { prisma } from './server'
import sha1 from 'sha1'


app.message(/./, async ({ message, say, logger }) => {
  if ('user' in message && message.user !== undefined) { // Not all messages have a user FIXME
    try {
      const _message = message as GenericMessageEvent
      const msg_ts = _message.thread_ts || _message.ts
      console.log(`*adding* message - ${msg_ts}`)

      const text = message && message.text || ''
      const length = message && message.text && message.text.length || 0
      await prisma.message.create({
        data: {
          ts: msg_ts,
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
      console.log(`ADDED message - ${msg_ts}`)

    } catch (e) {
      console.log(e)
    }
  }
})
