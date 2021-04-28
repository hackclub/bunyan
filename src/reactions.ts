import { ReactionMessageItem } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app, { prisma } from './server'


app.event('reaction_added', async ({ event, context, body }) => {
  try {
    console.log(`*adding* reaction - ${event.reaction}`)
    await prisma.reaction.create({
      data: {
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
    console.log(`ADDED reaction - ${event.reaction}`)

  } catch (e) {
    console.log(e)
  }
})
