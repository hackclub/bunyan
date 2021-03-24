import app from './server'
import {maPool, pushMas, pullMas, masStats, MA_INTERVAL} from './convos'
import './commands'


export default async function main() {
  const { HOST, PORT, NODE_ENV } = process.env
  await app.start({
    host: HOST,
    port: (PORT ? parseInt(PORT) : 3000),
  })
  console.log(`⚡️ Bolt app is running on http://${HOST}:${PORT}/ in mode='${NODE_ENV}'!`)

  console.table(maPool)
  await pullMas(maPool)
  console.table(maPool)

  setInterval(async () => {
    await pushMas(maPool, Date.now())
    console.table(masStats(maPool))
    //for (const maStats of masStats(maPool)) { console.log(JSON.stringify(maStats, null, 2)); }
  }, MA_INTERVAL)
}
