/**
File: data/getRoomStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file exports a function that can be used to create or retrieve a Basestore that is derived from a specific room name. These Basestores are then used by each individual room's NeutronDB for storing dDatabases that are replicated within it, by the peers involved in the room itself.
*/

import { getClient } from './../dhub/index.js'

export default async function getRoomStore (roomName) {
  const c = getClient()
  await c.ready()
  const ns = c.basestore(roomName)
  await ns.ready()
  const store = ns.default()
  await store.ready() // do we need to wait on store to be ready?
  return store
}