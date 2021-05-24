/**
File: authentication/identityHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns a list of all of the identities stored within the application's private database. Upon registration or syncing an identity from another device, an identity is saved in the application's private database.
*/

import path from 'path'
import { getPrivateDb } from './../data/getPrivateDb'
import { getIdentityDb } from './../data/getIdentityDb'
import { ID_DIR } from './../config'

async function identityExists (user) {
  let idLocation = path.join(ID_DIR, user)
  try {
    await fs.access(idLocation)
    return true
  } catch (err) {
    return false
  }  
}

async function identitiesExist () {
  const db = getPrivateDb()
  db.listIdentities()
      .then(()=>{return true})
      .catch(()=>{return false})
}

async function isUserAuthorized (user) {
  if (await identityExists(user)) {
    const db = getIdentityDb(user)
    const localKey = db.local.key
    db.authorized(localKey, (err, auth) => {
      if (err) return false
      else if (auth === true) return true
      else return false      
    })
  }
}