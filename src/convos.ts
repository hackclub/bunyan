import { GenericMessageEvent } from '@slack/bolt'
import MA, { MovingAverage } from './ma'
import app from './server'
import { airtable } from './api'


export const MA_INTERVAL = process.env.MA_INTERVAL
  ? parseInt(process.env.MA_INTERVAL, 10)
  : 1000 * 10 * 1  // 10 seconds
  //: 1000 * 30 * 1  // 30 seconds
  //: 1000 * 60 * 1  // one minute
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
  for (const [chId, chMa] of Object.entries(mas)) {
    if (chMa.watching === false) { console.log('not watching', chId); continue }
    try { // FIXME: this should happen in bulk
      chMa.ma.push(now, chMa.iMsgs)
      chMa.oMsgs += chMa.iMsgs
      chMa.iMsgs = 0
      const stats = maStats(chId, chMa.ma)
      //delete stats.id // FIXME
      const upsertData = { watching: chMa.watching, ...stats }
      await airtable.upsert(`slack_id`, upsertData)
    } catch (e) {
      console.error(e)
    }
  }
}

export async function pullMas(mas: MaPool) {
  const _mas = await airtable.read()
  for (const _ma of _mas) {
    try {
      const __ma = MA(MA_INTERVAL)
      maPool[_ma.fields.slack_id as string] = {
        iMsgs: 0,
        oMsgs: 0,
        watching: _ma.fields.watching as boolean,
        ma: MA(MA_INTERVAL).create(
          parseFloat(_ma.fields.average   as string),
          parseFloat(_ma.fields.variance  as string),
          parseFloat(_ma.fields.deviation as string),
          parseFloat(_ma.fields.forecast  as string),
          Date.now(),
        ),}
      //console.table(_ma.fields)
      //console.log(maPool[_ma.fields.slack_id as string], _ma.fields)
    } catch (e) {
      console.error(e)
    }
  }
}

export type MaStat = {
  slack_id:  string
  average:   string
  variance:  string
  deviation: string
  forecast:  string
}

export function maStats(slack_id: string, ma: MovingAverage) {
  const stats: MaStat = {
    slack_id,
    average:   (ma.average()   || 0).toString(),
    variance:  (ma.variance()  || 0).toString(),
    deviation: (ma.deviation() || 0).toString(),
    forecast:  (ma.forecast()  || 0).toString(),
  }
  return stats
}

export function masStats(mas: MaPool) {
  const _masStats: MaStat[] = []
  for (const [chId, chMa] of Object.entries(maPool)) {
    const stats = maStats(chId, chMa.ma)
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

