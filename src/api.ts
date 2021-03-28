import app, { receiver } from './server'
import { Request, Response, NextFunction } from 'express'
import { maPool, masStats, maStats } from './convos'


receiver.router.get(`/api/convos`, (req: Request, res: Response, next: NextFunction) => {
  res.json(masStats(maPool))
})


receiver.router.get(`/api/convo/:id`, (req: Request, res: Response, next: NextFunction) => {
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

