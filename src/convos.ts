import { GenericMessageEvent } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app, { prisma } from './server'


export const MA_INTERVAL = process.env.MA_INTERVAL
  ? parseInt(process.env.MA_INTERVAL, 10)
  //: 1000 * 10 * 1  // 10 seconds
  : 1000 * 30 * 1  // 30 seconds
  //: 1000 * 60 * 1  // one minute
  //: 1000 * 60 * 5  // five minutes
  //: 1000 * 60 * 30 // thirty minutes


export type MaPool = {
  [key: string]: { // a slack resource id
    ma: any           // a moving average instance
    iMsgs: number     // this interval's (pending) message count
    oMsgs: number     // old (previously processed) message count
    watching: boolean // are we tracking this resource?
  }
}


export const maPool: MaPool = {}

export function getMa(chId: string) {
  if (typeof chId !== 'string') { throw new Error(`invalid slack id '${chId}'`) }
  if (!maPool[chId]) {
    prisma.slackResource.upsert({
      where: { id: chId },
      create: { id: chId },
      update: {  },
    })
    maPool[chId] = {
      ma: MA(MA_INTERVAL),
      iMsgs: 0,
      oMsgs: 0,
      watching: true,
    }
  }
  return maPool[chId]
}


export async function pushMas(mas: MaPool, now: Date | number) {
  //if (initialPull === true) { return }
  const upsertData = []
  for (const [chId, chMa] of Object.entries(mas)) {
    if (chMa.watching === false) { console.log('not watching', chId); continue }
    const stats = maStats(chId, chMa.ma, chMa.iMsgs)
    stats.messages = chMa.iMsgs
    chMa.ma.push(now, chMa.iMsgs)
    chMa.oMsgs += chMa.iMsgs
    chMa.iMsgs = 0
    const upsertRow = { ...stats }
    upsertData.push(upsertRow)
  }
  try {
    await Promise.all(
      upsertData.map(async row => {
        await prisma.slackResource.upsert({
          where:  { id: row.slack_id },
          create: { id: row.slack_id },
          update: {  },
        })
        await prisma.movingAverage.create({data: row,})
      })
    )
  } catch (e) {
    console.error(e)
  }
}

export async function pullMas(mas: MaPool) {

  const slackResources = await prisma.slackResource.findMany({
    select: { id: true, },
    where: { watching: { equals: true, }, },
  })

  for (const _sa of slackResources) {
    const _ma = await prisma.movingAverage.findFirst({
      where: { slack_id: { equals: _sa.id, }, },
      orderBy: { created: 'desc', },
    })
    if (_ma === null) { throw new Error('broken movingAverage record') }

    maPool[_ma.slack_id] = {
      iMsgs: 0,
      oMsgs: 0,
      watching: true,
      ma: MA(MA_INTERVAL).create(
        _ma.average.toNumber(),
        _ma.variance.toNumber(),
        _ma.deviation.toNumber(),
        _ma.forecast.toNumber(),
        new Date(_ma.created).getTime(),
      ),
    }

    //getMa(_sa.id)
  }
}

export type MaStat = {
  slack_id:  string
  average:   string
  variance:  string
  deviation: string
  forecast:  string
  messages:  string
}

export function maStats(slack_id: string, ma: MovingAverage, messages: number | undefined) {
  const stats: MaStat = {
    slack_id,
    average:   (ma.average()   || 0).toString(),
    variance:  (ma.variance()  || 0).toString(),
    deviation: (ma.deviation() || 0).toString(),
    forecast:  (ma.forecast()  || 0).toString(),
    messages:  (messages       || 0).toString(),
  }
  return stats
}

export function masStats(mas: MaPool) {
  const _masStats: MaStat[] = []
  for (const [chId, chMa] of Object.entries(maPool)) {
    const stats = maStats(chId, chMa.ma, chMa.iMsgs)
    _masStats.push(stats)
  }
  return _masStats
}


app.message(/./, async ({ message, say, logger }) => {
  if ('user' in message && message.user !== undefined) { // Not all messages have a user FIXME
    const _message = message as GenericMessageEvent
    const thread_ts = _message.thread_ts || _message.ts
    //logger.info('❗ user message ❗', message)

    const chId = message.channel
    const chMa = getMa(chId)         // a moving average for a user
    const usMa = getMa(message.user) // a moving average for a channel
    if (typeof chMa === 'undefined') { throw new Error(`undefined maPool '${chId}'`) }
    if (typeof usMa === 'undefined') { throw new Error(`undefined maPool '${message.user}'`) }
    chMa.iMsgs += 1
    usMa.iMsgs += 1
  }
})

