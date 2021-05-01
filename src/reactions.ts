import { ReactionMessageItem } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app, { prisma, io } from './server'


app.event('reaction_added', async ({ event, context, body, client, logger }) => {
  try {
    const e = event
    setTimeout(async () => {
      const { channel } = await client.conversations.info({channel: (e as any).item.channel})
      const { user } = await client.users.info({user: e.user})
      logger.info(`:${e.reaction}: ${(user as any).profile.display_name || '_'}@${(channel as any).name} ${e.user}@${(e as any).item.channel}/${(e as any).item.ts}/${e.event_ts}`)
    }, 0)
    const reaction = await prisma.reaction.create({
      data: {
        ts: parseFloat((e as any).item.ts) || 0,
        event_ts: parseFloat(e.event_ts) || 0,
        emoji: {
          connectOrCreate: {
            create: {id: event.reaction},
            where:  {id: event.reaction},
          },
        },
        user: {
          connectOrCreate: {
            create: {id: event.user},
            where:  {id: event.user},
          },
        },
        channel: {
          connectOrCreate: {
            create: {id: (event.item as any).channel},
            where:  {id: (event.item as any).channel},
          },
        },
      },
    })

    io.emit("reaction", { reaction, })

  } catch (e) {
    logger.error(e)
  }
})
