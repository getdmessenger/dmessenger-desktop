/**
File: helpers/siepHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports helper functions that are used when receiving SIEP requests.
*/

import { getIdentityDb } from './../data/getIdentityDb'

export async function checkAuth (key, user) {
  let db = await getIdentityDb(user)
  db.authorized(key, (err, auth) => {
    if (err) return false
    else if (auth === true) return true
    else return false
  })
}

export async function authorizeKey (key, user) {
  let db = await getIdentityDb(user)
  db.authorize(key)
}