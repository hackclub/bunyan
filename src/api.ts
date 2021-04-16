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
    const stats = maStats(maId, ma)
    //stats.average = stats.average === undefined ? 0 : stats.average // FIXME
    res.status(200).json(stats)
  }
})

