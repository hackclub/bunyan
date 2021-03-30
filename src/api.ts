import app, { receiver } from './server'
import { Request, Response, NextFunction } from 'express'
import { maPool, masStats, maStats } from './convos'

import { AirtablePlusPlus } from 'airtable-plusplus'
//import { AirtablePlus } from 'airtable-plus'


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


const AIRTABLE_API_BASE = process.env.AIRTABLE_API_BASE ?? ''
const AIRTABLE_API_KEY  = process.env.AIRTABLE_API_KEY  ?? ''
const AIRTABLE_API_NAME = process.env.AIRTABLE_API_NAME ?? ''

if  (AIRTABLE_API_BASE === ''
  || AIRTABLE_API_KEY === ''
  || AIRTABLE_API_NAME === '') {
  throw new Error('missing airtable environment variables')
}

//const airtable = new AirtablePlus
export const airtable = new AirtablePlusPlus({
  baseId:    AIRTABLE_API_BASE,
  apiKey:    AIRTABLE_API_KEY,
  tableName: AIRTABLE_API_NAME,
})

