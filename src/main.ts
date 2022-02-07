import app, { prisma, io, io_http } from './server'
import {maPool, pushMas, pullMas, masStats, MA_INTERVAL} from './convos'
import './commands'


const { HOST, PORT, PORT_WS, NODE_ENV } = process.env

export default async function main() {
  await app.start({
    host: (HOST ? HOST : '0.0.0.0'),
    port: (PORT ? parseInt(PORT) : 3000),
  })
  console.log(`🪓 Paul Bunyan is logging on http://${HOST}:${PORT}/ in mode='${NODE_ENV}'!`)

  await pullMas()
  //await loopPushMas()
  setInterval(loopPushMas, MA_INTERVAL)
}


async function loopPushMas() {
  try {
    //await pullMas(maPool)
    //for (const maStats of masStats(maPool)) { console.log(JSON.stringify(maStats, null, 2)) }
    await pushMas(maPool, Date.now())
  } catch (e) {
    console.error(e)
  }

  const stats = []
  for (const maStat of masStats(maPool)) {
    if (parseFloat(maStat.average) > 0) {
      stats.push(maStat)
    }
  }
  if (stats.length > 0 && NODE_ENV !== 'production') {
    //console.log(stats.length, 'stats')
    //console.table(stats)
  }

  //console.table(masStats(maPool))
}
