/**
File: data/getLocalBase.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a Basestore that is derived from the namespace "dmessenger-local"
*/

import { getStoreInstance } from './getStoreInstance'

export default async function getLocalStore () {
  const basestore = getStoreInstance()
  await basestore.ready()
  
  const store = basestore.namespace("dmessenger-local")
  await store.ready()
  return store
}