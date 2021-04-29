import { prisma } from '../server'


async function main() {
  // we will run tests over this date range
  const TIMELEN_day = 1000 * 60 * 60 * 24 // ms s m h d
  // gt = further into the past <---<---
  const gt = new Date(Date.now() - TIMELEN_day*1.00)
  // lt = closer to the present --->--->
  const lt = new Date(Date.now() - TIMELEN_day*0.01)

  const topUsersForChannel = await TopUsersForChannel(['C01RNH6K9JS'], [gt, lt])
  console.info('\ngiven a channel_id and (start, end)::datetime, show the most frequent USERS for that channel')
  console.table(topUsersForChannel)

  const topEmojiForChannel = await TopEmojiForChannel(['C01HZ3J359B'], [gt, lt])
  console.info('\ngiven a channel_id and (start, end)::datetime, show the most frequent EMOJI for that channel')
  console.table(topEmojiForChannel)

  const topEmojiForUser = await TopEmojiForUser(['U01DV5F30CF'], [gt, lt])
  console.info('\ngiven a user_id and (start, end)::datetime, show the most frequent EMOJI for that user')
  console.table(topEmojiForUser)

  const topChannelsForUser = await TopChannelsForUser(['U01DV5F30CF'], [gt, lt])
  console.info('\ngiven a user_id and (start, end)::datetime, show the most frequent CHANNELS for that user')
  console.table(topChannelsForUser)

  const topChannelsForEmoji = await TopChannelsForEmoji(['peefest'], [gt, lt])
  console.info('\ngiven an emoji_id and (start, end)::datetime, show the most frequent CHANNELS for that emoji')
  console.table(topChannelsForEmoji)

  const topUsersForEmoji = await TopUsersForEmoji(['peefest'], [gt, lt])
  console.info('\ngiven an emoji_id and (start, end)::datetime, show the most frequent USERS for that emoji')
  console.table(topUsersForEmoji)
}


// {{{
export async function TopUsersForChannel(channel_ids: string[], [gt, lt]: Date[]) {
  const topUsersForChannel = await prisma.message.groupBy({
    by: ['user_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      channel_id: {in: channel_ids},
      created: { gt, lt, },
    },
  })
  return topUsersForChannel
}
// }}}


// {{{
export async function TopEmojiForChannel(channel_ids: string[], [gt, lt]: Date[]) {
  const topEmojiForChannel = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      channel_id: {in: channel_ids},
      created: { gt, lt, },
    },
  })
  console.table(topEmojiForChannel)
  return topEmojiForChannel
}
// }}}


// {{{
export async function TopEmojiForUser(user_ids: string[], [gt, lt]: Date[]) {
  const topEmojiForUser = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: user_ids},
      created: { gt, lt, },
    },
  })
  console.table(topEmojiForUser)
  return topEmojiForUser
}
// }}}


// {{{
export async function TopChannelsForUser(user_ids: string[], [gt, lt]: Date[]) {
  // INFO: a user can do TWO things in a channel (message, react)
  //       we gotta handle that..
  // ... this is a lot of code but i'm just
  // 1. turning the two arrays into objects{[.slack_id]: {.count}},
  // 2. and merging them by adding the `.count`s when channel_id appears in both
  // 3. turning the object back into single list of the same format
  // 4. sorting the list by `.count`

  const topChannelsForUser_messages = await prisma.message.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: user_ids},
      created: { gt, lt, },
    },
  }) //console.table(topChannelsForUser_messages)

  const topChannelsForUser_reactions = await prisma.reaction.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: user_ids},
      created: { gt, lt, },
    },
  }) //console.table(topChannelsForUser_reactions)

  // INFO: combine message and reaction count and sort by the result
  const _topChannelsForUser: {[key: string]: number} = {}
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
  return topChannelsForUser
}
// }}}


// {{{
export async function TopChannelsForEmoji(emoji_ids: string[], [gt, lt]: Date[]) {
  const topChannelsForEmoji = await prisma.reaction.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      emoji_id: {in: emoji_ids},
      created: { gt, lt, },
    },
  })
  console.table(topChannelsForEmoji)
  return topChannelsForEmoji
}
// }}}


// {{{
export async function TopUsersForEmoji(emoji_ids: string[], [gt, lt]: Date[]) {
  const topUsersForEmoji = await prisma.reaction.groupBy({
    by: ['user_id'],
    count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      emoji_id: {in: emoji_ids},
      created: { gt, lt, },
    },
  })
  console.table(topUsersForEmoji)
  return topUsersForEmoji
}
// }}}


//main()
