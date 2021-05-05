/**
File: data/getLocalBase.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file generates a local dDatabase, that is derived from a user's username. The dDatabase is stored in a Basestore under the name "dmessenger-local" which is imported from the ./getLocalStore module.
*/

import { getClient } from './../dhub/index.js'
import { getLocalStore } from './getLocalStore'

export default async function getLocalBase (username) {
  const c = getClient()
  await c.ready()
  const store = await getLocalStore()
  const base = store.get({ name: username })
  await base.ready()
  return base
}