/**
File: data/getIdentityDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that can retrieves a DWebIdentity instance, which is used to retrieve the dAppDB instance associated with it.
*/

import { identityExists } from './../authentication/authHelpers'
import { getIdentityInstance } from './../identity/getIdentityInstance'

export default async function getIdentityDb (user, opts) {
  return new Promise((resolve, reject) => {
    if (identityExists(user)) {
      const id = getIdentityInstance(user, opts)
      let db
      await id.getDb().then(iddb => db = iddb)
      return resolve(db)
    }  else {
      return reject()
    }
  })
}