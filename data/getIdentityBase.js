/**
File: data/getIdentityBase.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports the dDatabase that stores the MultiDTree related to a particular dWeb identity document (dWebID), all of which is derived from the passed-in username.
*/

import { getIdentityStore } from './getIdentityStore'

export default async function getIdentityBase (username) {
  const store = await getIdentityStore()
  await store.ready()
  const identityBase = store.get({
    name: username
  })
  await identityBase.ready()
  return identityBase
}