/**
File: data/getIdentityDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that can retrieves a DWebIdentity instance, which is used to retrieve the dAppDB instance associated with it.
*/

import { getIdentityInstance } from './../identity/getIdentityDb'

export default function getIdentityDb (user, opts) {
  const id = getIdentityInstance(user, opts)
  let db
  id.getDb().then(ddb => db = ddb)
  return db
}
