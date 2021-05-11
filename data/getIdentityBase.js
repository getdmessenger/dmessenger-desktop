/**
FIle: data/getIdentityBase.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module is used for retrieving a dDatabase from the user's IdentityStore (./data/getIdentityStore.js), which derives from the user's username.
*/

import { getClient } from './../dhub/index.js'
import { getIdentityStore } from './getIdentityStore'

export default async function getIdentityBase (username) {
  const c = getClient()
  await c.ready()
  const store = await getIdentityStore()
  const base = store.get({ name: username })
  await base.ready()
  return base
}