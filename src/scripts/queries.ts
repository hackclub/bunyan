import { prisma } from '../server'


async function main() {
  // {{{
  console.info('\ngiven a channel_id and (start, end)::datetime, show the most frequent USERS for that channel')
  const topUsersForChannel = await prisma.message.groupBy({
    by: ['user_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      channel_id: {in: ['C01RNH6K9JS']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.25 /* ms s m h d */ )),
      },
    },
  })

  console.table(topUsersForChannel)
  // }}}


  // {{{
  console.info('\ngiven a channel_id and (start, end)::datetime, show the most frequent EMOJI for that channel')
  const topEmojiForChannel = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      channel_id: {in: ['C01HZ3J359B']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.50 /* ms s m h d */ )),
      },
    },
  })

  console.table(topEmojiForChannel)
  // }}}


  // {{{
  console.info('\ngiven a user_id and (start, end)::datetime, show the most frequent EMOJI for that user')
  const topEmojiForUser = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: ['U01DV5F30CF']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.50 /* ms s m h d */ )),
      },
    },
  })

  console.table(topEmojiForUser)
  // }}}


  // {{{
  console.info('\ngiven a user_id and (start, end)::datetime, show the most frequent CHANNELS for that user')
  // INFO: a user can do TWO things in a channel (message, react)
  const topChannelsForUser_messages = await prisma.message.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: ['U01DV5F30CF']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.10 /* ms s m h d */ )),
      },
    },
  })
  //console.table(topChannelsForUser_messages)

  const topChannelsForUser_reactions = await prisma.reaction.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: ['U01DV5F30CF']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.10 /* ms s m h d */ )),
      },
    },
  })
  //console.table(topChannelsForUser_reactions)

  const _topChannelsForUser: {[key: string]: number} = {}
  // INFO: combine message and reaction count and sort by the result
  topChannelsForUser_messages.reduceRight(((acc, {channel_id, count}, i) => {
    if (!(channel_id in acc)) { acc[channel_id] = 0 }; acc[channel_id] += count._all; return acc
  }), _topChannelsForUser)
  topChannelsForUser_reactions.reduceRight(((acc, {channel_id, count}, i) => {
    if (!(channel_id in acc)) { acc[channel_id] = 0 }; acc[channel_id] += count._all; return acc
  }), _topChannelsForUser)
  const topChannelsForUser: {channel_id: string, count: number}[] = Object.entries(_topChannelsForUser)
    .map(([channel_id, count]) => ({channel_id, count}))
    .sort((x, y) => (y.count - x.count))

  console.table(topChannelsForUser)
  // }}}


  // {{{
  console.info('\ngiven an emoji_id and (start, end)::datetime, show the most frequent CHANNELS for that emoji')
  const topChannelsForEmoji = await prisma.reaction.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      emoji_id: {in: ['peefest']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.00 /* ms s m h d */ )),
      },
    },
  })
  console.table(topChannelsForEmoji)
  // }}}


  // {{{
  console.info('\ngiven an emoji_id and (start, end)::datetime, show the most frequent USERS for that emoji')
  const topUsersForEmoji = await prisma.reaction.groupBy({
    by: ['user_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      emoji_id: {in: ['peefest']},
      created: { // gt = further into the past, lt = closer to the present
        gt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1.00 /* ms s m h d */ )),
        lt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 0.00 /* ms s m h d */ )),
      },
    },
  })
  console.table(topUsersForEmoji)
  // }}}

}

main()
