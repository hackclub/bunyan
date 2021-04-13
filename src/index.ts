import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

//import './config'
import './server'
import './api'
import './home'

import main from './main'
import { prisma } from './server'
main()
  .finally(() => {
    prisma.$disconnect()
  })

export default {}
