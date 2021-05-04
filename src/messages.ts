import { GenericMessageEvent } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app, { prisma, io } from './server'
import sha1 from 'sha1'


app.message(/^zft1$/i, async ({ message, say, client, logger }) => {
  const { channels } = await client.users.conversations({user: 'UGS15J18R', limit: 10000})
  console.table(channels.map((x) => x.id))
  console.log('tryna join all...')
  if ((message as GenericMessageEvent).user !== 'U01DV5F30CF') { return }
  console.log('JOINING ALL CHANNELS')
  for (const channel of channels.slice()) {
    console.log('channels.length', channels.length)
    channels.shift()
    const inDb = await prisma.channel.findFirst({where: {id: channel}, })
    if (inDb === null) {
      try {
        const res = await client.conversations.join({channel})
        await prisma.channel.create({data: {id: channel}, })
        console.log(`JOINED ${channel}`, res)
      } catch (e) {
        console.log(`fail :/ ${channel}`)
        logger.error(e)
      }
    }
  }
})

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
