import { MaPool } from './convos'


export function sortedMas(maPool: MaPool) {
  return Object.entries(maPool)
    .sort((a, b) => {
      if (a[1].ma.average() < b[1].ma.average()) {
        return 1
      } else if (a[1].ma.average() > b[1].ma.average()) {
        return -1
      } else {
        return 0
      }
    })
}


export function nonzeroMas(maPool: MaPool) {
  return Object.values(maPool).filter((x) => {
    return x.ma.average() > 0
  })
}


export const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
