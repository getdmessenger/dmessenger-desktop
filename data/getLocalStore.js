/**
File: data/getLocalStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a dDatabase from within the "dmessenger-local" namespaced Basestore, which ultimately derives from the passed in username.
*/

import { getLocalStore } from './getLocalStore'

export default async function getLocalBase (username) {
  const store = await getLocalStore()
  await store.ready()
  const localBase = store.get({
    name: username
  })

  await localBase.ready()
  return localBase
}