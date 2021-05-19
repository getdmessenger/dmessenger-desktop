/**
File: data/getPrivateStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns a namespaced basestore used by the private database (classes/PrivateDb.js), which is a dWebTrie. The namespace derives from APP_NAME. The app itself maintains a single private database, which is used to store all the identities associated with the app (usernames and references to their document keys), along each user's encryption seed.
*/

import { APP_NAME } from './../config'
import { getStoreInstance } from './getStoreInstance'

export default async function getPrivateStore () {
  const basestore = getStoreInstance()
  await basestore.ready()
  const store = basestore.namespace(APP_NAME)
  await store.ready()
  return store
}