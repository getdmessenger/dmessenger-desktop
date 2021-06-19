import { getPriceDb, getGlobalPriceDb } from './../data'

export async function getUsdPrice (coin) {
  let db = await getPriceDb()
  let priceData = await db.get(`!prices!${coin}`)
  return priceData.value.quote.USD
}

export async function getSpecificPrice (coin, currency) {
  let db = await getGlobalPriceDb()
  let { value } = await db.get(`!prices!${coin}!${currency}`)
  return value
}