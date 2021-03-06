import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

//import './config'
import './server'
import './api'
import './home'
import './slashcmd'
import './reactions'
import './messages'

import main from './main'
import { prisma } from './server'
main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
process.on('SIGINT', async () => {
  console.log("Bye bye!")
  //await prisma.$disconnect()
  process.exit()
})

export default {}
