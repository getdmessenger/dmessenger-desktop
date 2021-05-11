/**
File: auth/createIdentity.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file is responsible for registering a user on dWeb's DHT and returning the data back to the UI and application state (username, publicKey, secretKey, signature, DID key and the sequence number).
*/

import { DWebIdentity } from '@dwebid/core'
import { getTreeBase } from './../data/getTreeBase'

export default async function createIdentity (username) {
  const uB = Buffer.from(username)
  const id = new DWebIdentity({
    base: await getTreeBase(username),
    username: uB
  })

  // We could use the checkUsernameAvailability() function from auth/checkAvailability.js but 
  // the checkUserAvailability() function is also available on the DWebIdentity class instance
  // so it's much easier here to just deal with the class instance we already interacting with.

  if (id.checkUserAvailability()) {
    id.register()
    id.on('registered', (data) => {
      return data
    })
  }
}