import { GenericMessageEvent } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import { snooze } from './util'
import app, { prisma, io } from './server'
import sha1 from 'sha1'
import { channels } from '../data/streamboot-data.old.json'


app.message(/^zft1$/i, async ({ message, say, client, logger }) => {
  //if (process.env.NODE_ENV !== 'production') { return }
  console.log('tryna join all...')
  if ((message as GenericMessageEvent).user !== 'U01DV5F30CF') { return }
  const getPage = async (cursor?: string) => {
    const { channels, response_metadata } = await client.users.conversations({
      user: 'USYUBKF1A' /* the fuzz */,
      limit: 128,
      cursor,
    })
    console.log((channels as any[]).length, response_metadata) //; return
    const $channels = []
    for (const c of (channels as any[])) { $channels.push(c.id) }
    //console.table(channels.map((x) => x.id))
    console.log('JOINING ALL CHANNELS')
    console.log('channels.length', (channels as any[]).length)
    for (const channel of $channels) {
      const inDb = await prisma.channel.findFirst({where: {id: channel}, })
      if (inDb === null) {
        try {
          const res = await client.conversations.join({channel})
          await prisma.channel.create({data: {id: channel}, })
          console.log(`JOINED ${(res as any).channel.id} ${(res as any).channel.name}`)
        } catch (e) {
          console.log(`fail :/ ${channel}`)
          logger.error(e)
        }
      }
      await snooze(3000)
    }
    if (response_metadata !== undefined && response_metadata.next_cursor) {
      await snooze(3000)
      await getPage(response_metadata.next_cursor)
    }
  }
  await getPage()
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
