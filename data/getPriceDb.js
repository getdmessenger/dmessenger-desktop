import DWebTree from 'dwebtree'
import { PRICE_DB_KEY } from './../config'
import { getLocalStore } from './'

export default async function getPriceDb () {
  let basestore = await getLocalStore()
  let feed = await basestore.get( { key: PRICE_DB_KEY })
  let priceTree = new DWebTree(feed, {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
  })
  return priceTree
}
