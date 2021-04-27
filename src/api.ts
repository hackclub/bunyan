import app, { prisma, receiver } from './server'
import { Request, Response, NextFunction } from 'express'
import { maPool, masStats, maStats } from './convos'
import cors from 'cors'
import path from 'path'


receiver.router.get(`/`, (req: Request, res: Response, next: NextFunction) => {
  res.redirect('https://github.com/hackclub/sb2')
})


receiver.router.get(`/demo`, cors(), (req: Request, res: Response, next: NextFunction) => {
  console.log(path.join(__dirname,'../public/demo.html'))
  res.sendFile(path.join(__dirname,'../public/demo.html'))
})

receiver.router.get(`/api/demo`, async (req: Request, res: Response, next: NextFunction) => {
  const results = await prisma.fiveMinEmaView.findMany({
    orderBy: [
      {
        ten_min_timestamp: 'desc'
      }
    ]
  })
  res.json(results)
})

receiver.router.get(`/api/demo-channel-lookup/:id`, async (req: Request, res: Response, next: NextFunction) => {
  const channel = req.params.id
  if (channel === undefined) {
    res.status(500).json({err: {code: 500, message: `resource is undefined`}})
  } else {
    try {
      const result = await app.client.conversations.info({channel, token: process.env.BOT_TOKEN})
      const name:string = result.channel.name
      res.json({name})
    } catch (e) {
      console.log(e)
      res.status(404).json({err: {code:404, message: `channel with ID '${req.query.id}' not found`}})
    }
  }
})


receiver.router.get(`/api/convos`, cors(), (req: Request, res: Response, next: NextFunction) => {
  res.json(masStats(maPool))
})


receiver.router.get(`/api/convo/:id`, cors(), (req: Request, res: Response, next: NextFunction) => {
  const maId = req.params.id
  if (maId === undefined) {
    res.status(500).json({err: {code: 500, message: `resource is undefined`}})
  }
  else if (!maPool[maId]) {
    res.status(404).json({err: {code: 404, message: `unaware of a resource '${maId}'`}})
  } else {
    const ma = maPool[maId]?.ma
    const stats = maStats(maId, ma, maPool[maId]?.iMsgs)
    //stats.average = stats.average === undefined ? 0 : stats.average // FIXME
    res.status(200).json(stats)
  }
})

const ARGS = {
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
}

receiver.router.get(`/api/convos/top`, cors(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    let arg_key: string
    if (ARGS.top.key.valid.includes(req.query.key as string)) { arg_key = req.query.key as string }
    else { arg_key = ARGS.top.key.default }

    let arg_take: number
    if (req.query.take) {
      const _arg_take = parseInt(req.query.take as string) || ARGS.top.take.default
      arg_take = Math.min(Math.max(_arg_take, ARGS.top.take.valid.min), ARGS.top.take.valid.max);
    }
    else { arg_take = ARGS.top.take.default }

    const tops = await prisma.movingAverage.findMany({
      distinct: ['slack_id'],
      select: { average: true, variance: true, deviation: true, forecast: true, slack_id: true, created: true, },
      where: {
        slack_id: { startsWith: 'C', },
        //average: {not: 0}, variance: {not: 0}, deviation: {not: 0}, forecast: {not: 0},
      },
      orderBy: {created: 'desc'},
    })

    if (tops.length < 1) {
      res.status(404).json({err: {code: 404, message: `empty resources`}})
    } else {
      tops.sort((x, y) => { return y[arg_key].toNumber() - x[arg_key].toNumber() })
      res.status(200).json(tops.slice(0, arg_take))
    }

  } catch (e) {
    console.error(e)
    res.status(500).json({err: {code: 500, message: `error getting resources`}})
  }
})

