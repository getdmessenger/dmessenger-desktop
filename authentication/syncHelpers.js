/**
File: authentication/syncHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports functions that are used as helper functions within the sync process.
*/

import { getPrivateDb } from './../data/getPrivateDb'

export default function checkForIdentity (user) {
  let db = await getPrivateDb()
  db.getIdentity((user)
      .then(()=>{return true})
      .catch(()=>{return false})
      )
}