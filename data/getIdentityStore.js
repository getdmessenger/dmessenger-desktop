/**
File: data/getIdentityStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports the Basestore that stores dWebIDs. The Basestore that holds identities is derived from the namespace "identities".
*/

import { getStoreInstance } from './getStoreInstance'

export default async function getIdentityStore () {
  const basestore = getStoreInstance()
  const store = basestore.namespace("identities")
  await store.ready()
  return store
}