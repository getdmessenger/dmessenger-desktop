/**
File: data/getLocalStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file generates a Basestore on dHub, derived from the name "dmessenger-local".
*/

import { getClient } from './../dhub/index.js'

export default async function getLocalStore () {
  const c = getClient()
  await c.ready()
  const store = c.basestore("dmessenger-local")
  await store.ready()
  return store
}
