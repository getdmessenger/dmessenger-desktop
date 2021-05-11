/**
File: data/getIdentityStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module is used for deriving and retrieving a Basestore by the "identity" string. This Basestore is used for storing dDatabases related to a user's identities.
*/

import { getClient } from './../dhub/index.js'

export default async function getIdentityStore () {
  const c = getClient()
  await c.ready()
  const store = c.basestore("identity")
  await store.ready()
  return store
}