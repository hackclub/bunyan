import { GenericMessageEvent } from '@slack/bolt'
import MA from 'moving-average'
import app from './server'


export const MA_INTERVAL = process.env.MA_INTERVAL
  ? parseInt(process.env.MA_INTERVAL, 10)
  : 1000 * 60 * 1  // one minute
  //: 1000 * 60 * 30 // thirty minutes


export type MaPool = {
  [key: string]: {
    ma: any
    iMsgs: number // this interval's (pending) message count
    oMsgs: number // old (previously processed) message count
  }
}


export const maPool: MaPool = {}

export function getMa(chId: string) {
  if (typeof chId !== 'string') { throw new Error(`invalid channel id '${chId}'`) }
  if (!maPool[chId]) {
    maPool[chId] = {
      ma: MA(MA_INTERVAL),
      iMsgs: 0,
      oMsgs: 0,
    }
  }
  return maPool[chId]
}


export function pushMas(mas: MaPool, now: Date | number) {
  for (const [chId, chMa] of Object.entries(mas)) {
    chMa.ma.push(now, chMa.iMsgs)
    chMa.oMsgs += chMa.iMsgs
    chMa.iMsgs = 0
  }
}


type MaStat = {
  id: string
  average:   number
  variance:  number
  deviation: number
  forecast:  number
}

export function maStats(id: string, ma: MA) {
  const stats: MaStat = {
    id,
    average:   ma.movingAverage(),
    variance:  ma.variance(),
    deviation: ma.deviation(),
    forecast:  ma.forecast(),
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
  if ('user' in message) { // Not all messages have a user FIXME
    const _message = message as GenericMessageEvent
    const thread_ts = _message.thread_ts || _message.ts
    //logger.info('❗ user message ❗', message)

    const chId = message.channel
    const chMa = getMa(chId)
    if (typeof chMa === 'undefined') { throw new Error(`undefined maPool '${chId}'`) }
    chMa.iMsgs += 1
  }
})

