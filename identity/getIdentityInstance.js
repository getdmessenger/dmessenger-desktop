/**
File: identity/getIdentityInstance.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns a DWebIdentity instance, for different use-cases, depending on the opts passed into the module. 
*/

import { DWebIdentity } from '@dwebid/core'
import { getIdentityStore } from './../data/getIdentityStore'
import { dhtOpts } from './../opts/dhtOpts'

export default async function getIdentityInstance (opts) {
  const { user, dk, seq, currentKeypair } = opts
  const store = await getIdentityStore(username)
  const idOpts = { dhtOpts, store, user }
  return new Promise ((resolve, reject) => {
    if (!user) return reject(new Error('opts must include a username'))
    if (!dk && !seq && !currentKeypair) {
      const id = new DWebIdentity({
        ...idOpts
      })
      resolve(id)
    }
    if (dk && seq && currentKeypair) {
      const id = new DWebIdentity({
        ...idOpts,
        dk,
        seq,
        currentKeypair
      })
      resolve(id)
    }
  })
}