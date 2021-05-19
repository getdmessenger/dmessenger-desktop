/**
File: data/getIdentityStore.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns a namespaced basestore used for a particular identity document, which is a multi-dwebtree. The namespace derives from the username associated with the identity document.
*/

import { getIdentityStoreInstance } from './getIdentityStoreInstance'

export default async function getIdentityStore (username) {
  const basestore = getIdentityStoreInstance()
  const store = basestore.namespace(username)
  await store.ready()
  return store
}