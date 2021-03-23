import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

//import './config'
import './server'
import './api'

import main from './main'; main()

export default {}
