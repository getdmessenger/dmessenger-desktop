/**
File: authentication/authHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports helper functions that can be used in the dMessenger authentication process.
*/

import fs from 'fs'
import path from 'path'
import { getPrivateDb } from './../data/getPrivateDb'
import { getIdentityDb } from './../data/getIdentityDb'
import { ID_DIR } from './../config'

export async function identityExists (user) {
  let idLocation = path.join(ID_DIR, user)
  try {
    await fs.access(idLocation)
    return true
  } catch (err) {
    return false
  }
}

export async function identitiesExist () {
  const db = await getPrivateDb()
  await db.listIdentities()
  .then(()=>{return true})
  .catch(()=>{return false})
}

export function isUserAuthorized (user) {
  if (identityExists(user)) {
    const db = getIdentityDb(user)
    const localKey = db.local.key
    db.authorized(localKey, (err, auth) => {
      if (err) return false
      else if (auth === true) return true
      else return false
    })
  }
}
