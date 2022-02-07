//import { RelationalScalarFieldEnum } from '@types/prisma'
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
export async function TopEmoji(take: number, [gt, lt]: Date[]) {
  const topEmoji = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    _count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
    take,
  })
  //console.table(topEmoji)
  return topEmoji
}
// }}}


// {{{
export async function TopMessagesBy(by: string[], take: number, [gt, lt]: Date[]) {
  const topMessagesBy = await prisma.message.groupBy({
    by: by as any[], // ['emoji_id', 'channel_id', 'user_id'], // probably choose one idk
    _count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
    take,
  })
  //console.table(topMessagesBy)
  return topMessagesBy
}

export async function TopReactionsBy(by: string[], take: number, [gt, lt]: Date[]) {
  const topReactionsBy = await prisma.reaction.groupBy({
    by: by as any[], // ['emoji_id', 'channel_id', 'user_id'], // probably choose one idk
    _count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
    take,
  })
  //console.table(topReactionsBy)
  return topReactionsBy
}

type TopForTmp = {[key: string]: {[key: string]: number}}
type TopForItem = {
  emoji_id?: string
  channel_id?: string
  user_id?: string
  count: {[key: string]: number}
}
export async function MergeGroups(by: string, xs: TopForItem[], ys: TopForItem[], key: string) {
  const tmp = {}
  xs.reduceRight(((acc: TopForTmp, stat: any, i) => {
    if (!acc) { throw new Error(`undefined acc for ${by} ${key}`) }
    if (!(stat[by] in acc)) { (acc as any)[stat[by]] = {_count: {[key]: 0}} };
    (acc as any)[stat[by]]._count[key] += stat._count[key]; return acc
  }), tmp)
  ys.reduceRight(((acc: TopForTmp, stat: any, i) => {
    if (!acc) { throw new Error(`undefined acc for ${by} ${key}`) }
    if (!(stat[by] in acc)) { (acc as any)[stat[by]] = {_count: {[key]: 0}} };
    (acc as any)[stat[by]]._count[key] += stat._count[key]; return acc
  }), tmp)
  const mergedSortedGroups = Object.entries(tmp)
    .map(([x, xstat]) => ({[by]: x, _count: (xstat as any)._count}))
    .sort((x, y) => ((y as any)._count[key] - (x as any)._count[key]))
  //console.table(mergedSortedGroups)
  return mergedSortedGroups
}
// }}}


// {{{
export async function TopUsers(take: number, [gt, lt]: Date[]) {
  const topUsersByMessage  = await TopMessagesBy(['user_id'],  take, [gt as Date, lt as Date])
  const topUsersByReaction = await TopReactionsBy(['user_id'], take, [gt as Date, lt as Date])
  const topUsers = MergeGroups('user_id', topUsersByMessage, topUsersByReaction, '_all')
  //console.table(topUsers)
  return topUsers
}
// }}}


// {{{
export async function TopChannels(take: number, [gt, lt]: Date[]) {
  const topChannelsByMessage  = await TopMessagesBy(['channel_id'],  take, [gt as Date, lt as Date])
  const topChannelsByReaction = await TopReactionsBy(['channel_id'], take, [gt as Date, lt as Date])
  const topChannels = MergeGroups('channel_id', topChannelsByMessage, topChannelsByReaction, '_all')
  //console.table(topChannels)
  return topChannels
}
// }}}


// {{{
export async function TopUsersForChannel(channel_ids: string[], [gt, lt]: Date[]) {
  const topUsersForChannel = await prisma.message.groupBy({
    by: ['user_id'],
    _count: {_all: true},
    orderBy: {_count: {id: 'desc'}},
    where: {
      channel_id: {in: channel_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
  })
  //console.table(topUsersForChannel)
  return topUsersForChannel
}
// }}}


// {{{
export async function TopEmojiForChannel(channel_ids: string[], [gt, lt]: Date[]) {
  const topEmojiForChannel = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    count: {_all: true},
    _orderBy: {_count: {id: 'desc'}},
    where: {
      channel_id: {in: channel_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
  })
  //console.table(topEmojiForChannel)
  return topEmojiForChannel
}
// }}}


// {{{
export async function TopEmojiForUser(user_ids: string[], [gt, lt]: Date[]) {
  const topEmojiForUser = await prisma.reaction.groupBy({
    by: ['emoji_id'],
    count: {_all: true},
    _orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: user_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
  })
  //console.table(topEmojiForUser)
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
    _orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: user_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
  }) //console.table(topChannelsForUser_messages)

  const topChannelsForUser_reactions = await prisma.reaction.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    _orderBy: {_count: {id: 'desc'}},
    where: {
      user_id: {in: user_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
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
    .sort((x, y) => (y._count - x._count))

  //console.table(topChannelsForUser)
  return topChannelsForUser
}
// }}}


// {{{
export async function TopChannelsForEmoji(emoji_ids: string[], [gt, lt]: Date[]) {
  const topChannelsForEmoji = await prisma.reaction.groupBy({
    by: ['channel_id'],
    count: {_all: true},
    _orderBy: {_count: {id: 'desc'}},
    where: {
      emoji_id: {in: emoji_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
  })
  //console.table(topChannelsForEmoji)
  return topChannelsForEmoji
}
// }}}


// {{{
export async function TopUsersForEmoji(emoji_ids: string[], [gt, lt]: Date[]) {
  const topUsersForEmoji = await prisma.reaction.groupBy({
    by: ['user_id'],
    _count: {_all: true},
    _orderBy: {_count: {id: 'desc'}},
    where: {
      emoji_id: {in: emoji_ids},
      created: { gt, lt, },
      user:    { watching: true },
      channel: { watching: true },
    },
  })
  //console.table(topUsersForEmoji)
  return topUsersForEmoji
}
// }}}


//main()
