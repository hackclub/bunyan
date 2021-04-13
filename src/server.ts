import { App, LogLevel, SocketModeReceiver, ExpressReceiver } from '@slack/bolt'
import fs from 'fs'
import util from 'util'
import path from 'path'

import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()


const writeFile = util.promisify(fs.writeFile)

const ENV = process.env

const appOptions: any = {
  signingSecret: ENV.SIGNING_SECRET,
  //appId: ENV.APP_ID,
  //clientId: ENV.CLIENT_ID,
  //clientSecret: ENV.CLIENT_SECRET,
  //stateSecret: ENV.STATE_SECRET,
}
if (ENV.NODE_ENV === 'development') {
  // FIXME: make oauth work for dev

  const clientOptions = {
    //slackApiUrl: 'https://dev.slack.com/api/',
  }

  //appOptions.clientOptions = clientOptions
  appOptions.socketMode = false
  appOptions.appToken = ENV.APP_TOKEN
  appOptions.token = ENV.BOT_TOKEN

} else {
  appOptions.token = ENV.BOT_TOKEN
}

appOptions.receiver = new ExpressReceiver({ signingSecret: ENV.SIGNING_SECRET ?? '' })

const app = new App(appOptions)

export const receiver = appOptions.receiver

export default app
