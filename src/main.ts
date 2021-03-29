import app from './server'
import {maPool, pushMas, pullMas, masStats, MA_INTERVAL} from './convos'
import './commands'


export default async function main() {
  const { HOST, PORT, NODE_ENV } = process.env
  await app.start({
    host: (HOST ? HOST : '0.0.0.0'),
    port: (PORT ? parseInt(PORT) : 3000),
  })
  console.log(`⚡️ Bolt app is running on http://${HOST}:${PORT}/ in mode='${NODE_ENV}'!`)

  await pullMas(maPool)
  await loopPushMas()
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

  console.table(masStats(maPool))
}
