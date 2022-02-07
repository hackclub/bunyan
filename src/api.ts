import app, { prisma, receiver } from './server'
import express, { Request, Response, NextFunction } from 'express'
import { maPool, masStats, maStats } from './convos'
import cors from 'cors'

receiver.router.use(express.static('public'))

receiver.router.get(`/api/demo`, async (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})

receiver.router.get(`/api/demo-channel-lookup/:id`, async (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})


receiver.router.get(`/api/convos`, cors(), (req: Request, res: Response, next: NextFunction) => {
  res.json(masStats(maPool))
})


receiver.router.get(`/api/convo/:id`, cors(), (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})


const ARGS = {
  convos: {
    top: {
      key: {
        valid: [ 'average', 'variance', 'deviation', 'forecast', 'messages', ],
        default: 'average',
    },
      take: {
        valid: {min: 0, max: 256},
        default: 10,
      },
    },
  },
  top: {
    emoji: {
      valid: {}
    },
    channels: {},
    users: {},
  },
}


receiver.router.get(`/api/convos/top`, cors(), async (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})


// "the most popular emoji (in the past hour) (by reaction frequency, descending) [in b-flat]"
receiver.router.get(`/api/top/emoji`, cors(), async (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})


// "the most active users (in the past hour) (by message frequency, descending) {zfogg remix}"
receiver.router.get(`/api/top/users`, cors(), async (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})


// "the most active channels (in the past hour) (by message frequency, descending) <skrillex live edit>"
receiver.router.get(`/api/top/channels`, cors(), async (req: Request, res: Response, next: NextFunction) => {
  res.json({})
})
