'use strict'

// INFO: https://raw.githubusercontent.com/pgte/moving-average/master/index.js


const exp = Math.exp


export type MovingAverage = {
  create:    (average: number, variance: number, deviation: number, forecase: number, previous: number) => MovingAverage
  push:      (time: number, value: number) => void
  average:   () => number
  variance:  () => number
  deviation: () => number
  forecast:  () => number
}


export default function MA(timespan: number) {
  if (typeof timespan !== 'number') { throw new Error('must provide a timespan to the moving average constructor') }

  if (timespan <= 0) { throw new Error('must provide a timespan > 0 to the moving average constructor') }

  let ma: number      // moving average
  let v: number  = 0  // variance
  let d: number  = 0  // deviation
  let f: number  = 0  // forecast

  let previousTime: number

  function alpha (t: number, pt: number) {
    return 1 - (exp(-(t - pt) / timespan))
  }

  let ret: MovingAverage = {
    create: (average: number, variance: number, deviation: number, forecast: number, previous: number) => {
      ma = average
      v = variance
      d = deviation
      f = forecast
      previousTime = previous
      return ret
    },

    push: (time, value) => {
      if (previousTime) {
        // calculate moving average
        const a = alpha(time, previousTime)
        const diff = value - ma
        const incr = a * diff
        ma = a * value + (1 - a) * ma
        // calculate variance & deviation
        v = (1 - a) * (v + diff * incr)
        d = Math.sqrt(v)
        // calculate forecast
        f = ma + a * diff
      } else {
        ma = value
      }
      previousTime = time
    },

    // Exponential Moving Average
    average: () => { return ma },

    variance: () => { return v },

    deviation: () => { return d },

    forecast: () => { return f },
  }

  return ret
}
